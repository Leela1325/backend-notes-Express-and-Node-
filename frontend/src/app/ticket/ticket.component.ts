import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TicketService, TicketFilter } from './ticket.service';
import { ProductService } from '../shared/product.service';
import { SupplierDaoService } from '../dao/supplierdao.service';

import { ticket, TicketSupplier } from './ticket.model';
import { Product } from '../models/product.model';
import { Supplier } from '../models/supplier.model';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    DatePipe,
  ],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent implements OnInit {
  allTickets: ticket[] = [];
  filteredTickets: ticket[] = [];
  selectedFilter: TicketFilter = 'APPROVED';

  showExpiryModal = false;
  ticketToApprove: ticket | null = null;
  expiryDate: string = '';
  price: number | null = null; // NEW

  todayDate: string = new Date().toISOString().split('T')[0];

  productsMap = new Map<string, Product>();
  suppliersMap = new Map<string, Supplier>();

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  constructor(
    private ticketService: TicketService,
    private productService: ProductService,
    private supplierDaoService: SupplierDaoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.ticketService.checkLowStock().subscribe({
      next: (response) => {
        console.log('Stock check:', response.message);
        this.loadAllData();
      },
      error: (err) => {
        console.error('Stock check failed:', err);
        this.loadAllData();
      },
    });
  }

  private loadAllData(): void {
    forkJoin({
      tickets: this.ticketService.getAllTickets(),
      products: this.productService.getAllProducts(),
      suppliers: this.supplierDaoService.getAllSuppliers(),
    }).subscribe({
      next: ({ tickets, products, suppliers }) => {
        // Backend already sorts by updatedat (falling back to createdAt) desc, so the order is correct
        this.allTickets = tickets;
        this.productsMap.clear();
        this.suppliersMap.clear();
        products.forEach((p) => this.productsMap.set(p.id, p));
        suppliers.forEach((s) => this.suppliersMap.set(s.id, s));
        this.assignDefaultSuppliersForPendingTickets();
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load data:', err);
        this.snackBar.open('Failed to load tickets', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  // no .sort() — sorting creates new object copies that break ngModel two-way binding
  get pendingTickets(): ticket[] {
    return this.allTickets.filter((t) => t.status === 'PENDING');
  }

  applyFilter(): void {
    this.filteredTickets = this.ticketService.filterTickets(
      this.allTickets,
      this.selectedFilter,
    );
  }

  getSuppliersForTicket(ticketItem: ticket): TicketSupplier[] {
    return ticketItem.suppliers || [];
  }

  getDisplaySupplierForTicket(ticketItem: ticket): TicketSupplier | null {
    const suppliers = ticketItem.suppliers || [];
    if (!suppliers.length) return null;
    if (ticketItem.supplierId) {
      const matched = suppliers.find((s) => s.id === ticketItem.supplierId);
      if (matched) return matched;
    }
    return suppliers[0];
  }

  getHighestRatedSupplierForTicket(ticketItem: ticket): TicketSupplier | null {
    return (ticketItem.suppliers || [])[0] || null;
  }

  // iterate allTickets directly — pendingTickets getter returns filtered references
  private assignDefaultSuppliersForPendingTickets(): void {
    this.allTickets
      .filter((t) => t.status === 'PENDING' && !t.supplierId)
      .forEach((ticket) => {
        const suppliers = ticket.suppliers || [];
        if (!suppliers.length) return;
        const bestSupplier = suppliers[0];
        ticket.supplierId = bestSupplier.id;
        this.ticketService
          .updateSupplier(ticket.id, bestSupplier.id)
          .subscribe({
            error: (err) => console.error('Failed to assign supplier:', err),
          });
      });
  }

  onSupplierChange(ticketItem: ticket): void {
    if (!ticketItem.supplierId) return;
    this.ticketService
      .updateSupplier(ticketItem.id, ticketItem.supplierId)
      .subscribe({
        next: () => {},
        error: (err) => console.error('Patch error:', err),
      });
  }

  raiseTicket(
    productid: string,
    productName: string,
    requestedQuantity: number,
  ): void {
    this.ticketService
      .createTicket(productid, productName, requestedQuantity)
      .subscribe({
        next: (newTicket) => {
          this.allTickets = [newTicket, ...this.allTickets];
          this.selectedFilter = 'PENDING';
          this.applyFilter();
          this.snackBar.open('Ticket raised successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (err) => {
          const body = err?.error;
          if (err.status === 409) {
            this.snackBar.open(
              body?.message || 'Zone capacity exceeded',
              'Close',
              { duration: 6000 },
            );
          } else {
            this.snackBar.open(
              body?.message || 'Failed to raise ticket',
              'Close',
              { duration: 3000 },
            );
          }
        },
      });
  }

  confirmApprove(ticketItem: ticket): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Approval',
        message: 'Are you sure you want to approve this ticket?',
        type: 'approve',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const liveTicket = this.allTickets.find((t) => t.id === ticketItem.id);
        if (!liveTicket) return;

        if (!liveTicket.supplierId) {
          this.snackBar.open(
            'Please select a supplier before approving',
            'Close',
            { duration: 3000 },
          );
          return;
        }
        if (
          !liveTicket.requestedQuantity ||
          liveTicket.requestedQuantity <= 0
        ) {
          this.snackBar.open(
            'Requested quantity must be greater than 0',
            'Close',
            { duration: 3000 },
          );
          return;
        }

        this.ticketToApprove = liveTicket;
        this.expiryDate = '';
        this.showExpiryModal = true;
      }
    });
  }

  closeExpiryModal(): void {
    this.showExpiryModal = false;
    this.ticketToApprove = null;
    this.expiryDate = '';
    this.price = null;
  }

  submitExpiryAndApprove(): void {
    if (!this.expiryDate || !this.ticketToApprove) return;
    if (!this.price || this.price <= 0) {
      this.snackBar.open('Price must be greater than 0', 'Close', {
        duration: 3000,
      });
      return;
    }

    const ticketItem = this.ticketToApprove;
    const expiry = this.expiryDate;
    const price = this.price; // NEW — capture before resetting

    if (!ticketItem.supplierId) {
      this.snackBar.open('Please select a supplier', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.showExpiryModal = false;
    this.ticketToApprove = null;
    this.expiryDate = '';
    this.price = null; // NEW

    this.ticketService
      .updateSupplier(ticketItem.id, ticketItem.supplierId)
      .subscribe({
        next: () => {
          this.ticketService
            .updateRequestedQuantity(
              ticketItem.id,
              ticketItem.requestedQuantity,
            )
            .subscribe({
              next: () => this.proceedWithApproval(ticketItem, expiry, price), // NEW arg
              error: (err) => {
                this.snackBar.open(
                  err?.error?.message || 'Failed to save quantity',
                  'Close',
                  { duration: 5000 },
                );
              },
            });
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Failed to save supplier',
            'Close',
            { duration: 5000 },
          );
        },
      });
  }
  private proceedWithApproval(
    ticketItem: ticket,
    expirydate: string,
    price: number,
  ): void {
    this.ticketService.approveTicket(ticketItem, expirydate, price).subscribe({
      next: (response) => {
        
        const updatedTicket: ticket = {
          ...response,
          suppliers: ticketItem.suppliers,
        };

        this.allTickets = [
          updatedTicket,
          ...this.allTickets.filter((t) => t.id !== ticketItem.id),
        ];

        this.selectedFilter = 'APPROVED';
        this.applyFilter(); 

        this.snackBar.open('Ticket approved successfully', 'Close', {
          duration: 3000,
        });

        this.router.navigate([`${ticketItem.supplierId}`, 'submit-feedback'], {
          relativeTo: this.activatedRoute,
        });
      },
      error: (err) => {
        const body = err?.error;
        if (err.status === 409) {
          this.snackBar.open(
            body?.message || 'Zone is full — cannot approve',
            'Close',
            { duration: 6000 },
          );
        } else {
          this.snackBar.open(
            body?.message || 'Failed to approve ticket',
            'Close',
            { duration: 5000 },
          );
        }
      },
    });
  }

  confirmDisapprove(ticketItem: ticket): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Disapproval',
        message: 'Are you sure you want to disapprove this ticket?',
        type: 'disapprove',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.disapprove(ticketItem);
    });
  }

  disapprove(ticketItem: ticket): void {
    this.ticketService.disapproveTicket(ticketItem).subscribe({
      next: () => {
        // Move the rejected ticket to the top of allTickets, mirroring the backend's updatedat sort
        const rejected: ticket = { ...ticketItem, status: 'REJECTED' };
        this.allTickets = [
          rejected,
          ...this.allTickets.filter((t) => t.id !== ticketItem.id),
        ];
        this.selectedFilter = 'REJECTED';
        this.applyFilter();
        this.snackBar.open('Ticket rejected', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to reject ticket',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }

  saveQuantity(ticketItem: ticket): void {
    if (!ticketItem.requestedQuantity || ticketItem.requestedQuantity <= 0) {
      this.snackBar.open('Quantity must be greater than 0', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.ticketService
      .updateRequestedQuantity(ticketItem.id, ticketItem.requestedQuantity)
      .subscribe({
        next: () => {
          (ticketItem as any).isEditing = false;
          this.snackBar.open('Quantity updated', 'Close', { duration: 2000 });
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Failed to update quantity',
            'Close',
            { duration: 3000 },
          );
        },
      });
  }
}
