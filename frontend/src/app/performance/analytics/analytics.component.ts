import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategorySalesComponent } from "./category-sales/category-sales.component";
import { TreemapComponent } from "./treemap/treemap.component";
import { BadPerformanceComponent } from "./bad-performance/bad-performance.component";
import { PerformanceService } from '../performance.service';
import { ProductPerformanceComponent } from "./product-performance/product-performance.component";
import { DailySalesChartComponent } from "./daily-sales-chart/daily-sales-chart.component";


type ProductOption = {
  id: string;
  name: string;
  description: string;
};

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CategorySalesComponent,
    TreemapComponent,
    BadPerformanceComponent,
    ProductPerformanceComponent,
    DailySalesChartComponent
],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  private performanceService = inject(PerformanceService);

  productSearch = '';
  selectedProduct: ProductOption | null = null;
  isDropdownOpen = false;

  private allProducts: ProductOption[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.performanceService.getAllProductsNames().subscribe(data => {
      this.allProducts = data.map(product => ({
        id: product._id,
        name: product.name,
        description: product.description ?? ''
      }));
    });
  }

  get filteredProducts(): ProductOption[] {
    const q = this.productSearch.trim().toLowerCase();
    if (!q) return [];
    return this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) 
    );
  }

  onSearchInput(): void {
    this.isDropdownOpen = this.productSearch.trim().length > 0;
    if (this.selectedProduct && this.productSearch !== this.selectedProduct.name) {
      this.selectedProduct = null;
    }
  }

  selectProduct(product: ProductOption): void {
    this.selectedProduct = product;
    this.productSearch = product.name;
    this.isDropdownOpen = false;
  }

  clearProduct(): void {
    this.selectedProduct = null;
    this.productSearch = '';
    this.isDropdownOpen = false;
  }

  closeDropdown(): void {
    setTimeout(() => { this.isDropdownOpen = false; }, 150);
  }

}