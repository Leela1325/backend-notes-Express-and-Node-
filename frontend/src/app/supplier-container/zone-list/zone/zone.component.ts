import { Component, inject, input, SimpleChanges } from '@angular/core';
import { CategoryService } from '../../category-list/category/category.service';
import { SupplierService } from '../../supplier-list/supplier/supplier.service';
import { Category } from '../../category-list/category/category.model';
import { Supplier } from '../../supplier-list/supplier/supplier.model';
import { Zone } from './zone.model'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.scss'
})
export class ZoneComponent {

  name = input.required<string>();
  zoneid = input.required<String>();
  categories = input.required<Category[]>();
  suppliers = input.required<Supplier[]>();
  zoneObject = input.required<Zone>(); 

  categoryService = inject(CategoryService);
  supplierService = inject(SupplierService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  categoryArr: Category[] = [];
  supplierArr: Supplier[] = [];
  activecount = 0;
  inactivecount = 0;

  ngOnChanges(sampleData: SimpleChanges) {
   
    this.updatecount();
  }

  updatecount() {
    this.activecount = this.suppliers().filter(x => x.active).length;
    this.inactivecount = this.suppliers().filter(x => !x.active).length;
  }

  navigateUser() {
    this.router.navigate([`${this.zoneid()}`, 'category-list'], {
      relativeTo: this.activatedRoute
    });
  }
}