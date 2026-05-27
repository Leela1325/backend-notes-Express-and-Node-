import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { sales } from './sales.model';
import { SalesService } from './sales.service';
import { SupplierService } from '../supplier-container/supplier-list/supplier/supplier.service';

import { CategorydaoService } from '../dao/categorydao.service';
import { ProductDaoService } from '../dao/productdao.service';
import { ZonedaoService } from '../dao/zonedao.service';
import { TicketDaoService } from '../dao/ticketdao.service';

import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Zone } from '../models/zone.model';
import { ticket } from '../ticket/ticket.model';

import { StockConfirmDialogComponent } from './stockconfirmdialog.component';
import { ActivityDaoService } from '../dao/activitydao.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    FormsModule,
    DatePipe,
    MatDialogModule
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
})
export class SalesComponent implements OnInit {

  allsales: sales[] = [];
  filteredSales: sales[] = [];

  zones: Zone[] = [];
  categories: Category[] = [];
  products: Product[] = [];

  selectedZoneId = '';
  selectedCategoryId = '';
  selectedProductId = '';
  activityService = inject(ActivityDaoService);
  selectedFilter: 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY';
  sortCategoryOrder: 'ASC' | 'DESC' = 'ASC';

  availableQuantity: number | null = null;

  newSale: sales = {
    id: '',
    productid: '',
    productname: '',
    categoryid: '',
    category: '',
    quantity: 0,
    avgprice: 0,
    timestamp: '',
  };

  constructor(
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private categoryDaoService: CategorydaoService,
    private productDaoService: ProductDaoService,
    private zoneDaoService: ZonedaoService,
    private ticketDao: TicketDaoService,
    private supplierservice: SupplierService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.zoneDaoService.getAllZones().subscribe(z => {
      this.zones = z;
    });

    this.salesService.getAllSales().subscribe(res => {
      this.allsales = res;
      this.applyFilter();
    });
  }

  get isStockExceeded(): boolean {
    return (
      this.availableQuantity !== null &&
      this.newSale.quantity > this.availableQuantity
    );
  }

  applyFilter(): void {
    this.filteredSales = this.salesService.filterSales(
      [...this.allsales],
      this.selectedFilter
    );
  }

  sortByCategory(): void {
    this.filteredSales = [...this.filteredSales].sort((a, b) => {
      const catA = a.category.toLowerCase();
      const catB = b.category.toLowerCase();

      return this.sortCategoryOrder === 'ASC'
        ? catA.localeCompare(catB)
        : catB.localeCompare(catA);
    });

    this.sortCategoryOrder =
      this.sortCategoryOrder === 'ASC' ? 'DESC' : 'ASC';
  }

  onZoneChange(): void {
    this.selectedCategoryId = '';
    this.selectedProductId = '';
    this.products = [];
    this.categories = [];
    this.availableQuantity = null;
    this.newSale.productname = '';

    if (!this.selectedZoneId) return;

    this.categoryDaoService
      .getCategoriesByZone(this.selectedZoneId)
      .subscribe(c => (this.categories = c));
  }

  onCategoryChange(): void {
    this.selectedProductId = '';
    this.availableQuantity = null;
    this.products = [];
    this.newSale.productname = '';

    if (!this.selectedCategoryId) return;

    this.productDaoService
      .getProductsByZoneAndCategory(
        this.selectedZoneId,
        this.selectedCategoryId
      )
      .subscribe(p => (this.products = p));
  }

  onProductChange(): void {
    this.availableQuantity = null;
    this.selectedProductId = '';

    if (!this.newSale.productname) return;

    this.productDaoService
      .getProductByName(this.newSale.productname)
      .subscribe(products => {
        if (!products || products.length === 0) return;

        const product = products[0];
        this.selectedProductId = product.id;

        const now = new Date();
        this.availableQuantity =
          product.inventory
            ?.filter(
              (batch) =>
          !batch.expirydate || new Date(batch.expirydate) > now
            )
            .reduce(
              (sum: any, batch: any) => sum + batch.quantity,
              0
            ) ?? 0;
      });
  }

  submitSale(): void {
    if (!this.newSale.productname || this.newSale.quantity <= 0) return;

    if (this.isStockExceeded) return;

    this.salesService.submitSale(this.newSale).subscribe({
      next: sale => {
        this.allsales.unshift(sale);
        this.applyFilter();
        this.resetSaleForm();

        this.snackBar.open('Sale recorded successfully', 'Close', {
          duration: 3000,
        });
      },
      error: err => {
        this.snackBar.open(`${err.message ?? err}`, 'Close', {
          duration: 3000,
        });
      },
    });
  }

  raiseTicket(): void {
    if (!this.newSale.productname || this.newSale.quantity <= 0) return;

    const dialogRef = this.dialog.open(StockConfirmDialogComponent, {
      width: '420px',
      data: {
        productName: this.newSale.productname,
        availableQuantity: this.availableQuantity,
        requestedQuantity: this.newSale.quantity,
      },
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm !== true) return;

      this.ticketDao.createTicket(
        this.selectedProductId,
        this.newSale.productname,
        this.newSale.quantity
      ).subscribe({
        next: () => {
          this.snackBar.open(
            'Stock request ticket raised successfully',
            'Close',
            { duration: 4000 }
          );
          this.resetSaleForm();
        },
        error: (err) => {
          const body = err?.error;
          if (err.status === 409) {
            this.snackBar.open(
              body?.message || 'Zone capacity exceeded',
              'Close',
              { duration: 6000 }
            );
          } else {
            this.snackBar.open(
              body?.message || 'Failed to raise ticket',
              'Close',
              { duration: 3000 }
            );
          }
        },
      });
    });
  }

  resetSaleForm(): void {
    this.newSale = {
      id: '',
      productid: '',
      productname: '',
      categoryid: '',
      category: '',
      quantity: 0,
      avgprice: 0,
      timestamp: '',
    };

    this.selectedZoneId = '';
    this.selectedCategoryId = '';
    this.selectedProductId = '';

    this.categories = [];
    this.products = [];

    this.availableQuantity = null;
  }
}