import { Component, computed, inject, input, signal, SimpleChanges } from '@angular/core';
import { Supplier } from '../../supplier-list/supplier/supplier.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from './category.model';
import { SupplierService } from '../../supplier-list/supplier/supplier.service';
import { CategoryService } from './category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  name = input.required<string>();
  supplierArray = input.required<Supplier[]>();
  categoryId = input.required<string>();
  categoryObject=input<Category | null>(null);

  categoryService=inject(CategoryService)
  
  router = inject(Router);
  route = inject(ActivatedRoute);

 
  active = computed(() => this.supplierArray().filter(supplier => supplier.active).length);
  inactive = computed(() => this.supplierArray().filter(supplier => !supplier.active).length);

  navigateToSuppliers() 
  {
    this.router.navigate([`${this.categoryId()}`, 'suppliers-list'], {
      relativeTo: this.route
    });
  }
}