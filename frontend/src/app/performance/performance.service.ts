import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  CategoryAnalytic,
  DailySale,
  ProductDailySale,
  ProductOverview,
  ProductPerformanceData,
  WeeklyCategorySales
} from './sales.model';

const API_BASE = 'http://localhost:4040';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private http = inject(HttpClient);

  public allCategories: string[] = [];

  getAllCategories(): Observable<{ _id: string; name: string }[]> {
    return this.http
      .get<{ _id: string; name: string }[]>(`${API_BASE}/categories/all`)
      .pipe(tap(categories => {
        this.allCategories = categories.map(c => c.name);
      }));
  }

  getAllProductsNames(): Observable<{ _id: string; name: string; description: string }[]> {
    return this.http.get<{ _id: string; name: string; description: string }[]>(
      `${API_BASE}/products/all`
    );
  }
  
  getCategoryPerformers(
    categoryid: string,
    days: number,
    type: 'best' | 'worst'
  ): Observable<CategoryAnalytic[]> {
    const params = new HttpParams().set('days', days).set('type', type);
    return this.http.get<CategoryAnalytic[]>(
      `${API_BASE}/analytics/categories/${categoryid}/top-products`,
      { params }
    );
  }

  getCategoryAnalytics(
    category: string,
    days: number,
    type: 'BEST' | 'WORST'
  ): Observable<CategoryAnalytic[]> {
    return this.getCategoryPerformers(
      category, days, type === 'BEST' ? 'best' : 'worst'
    );
  }

  getDailySalesByCategory(categoryid: string, days: number): Observable<DailySale> {
    const params = new HttpParams().set('days', days);
    return this.http.get<DailySale>(
      `${API_BASE}/analytics/categories/${categoryid}/daily-sales`,
      { params }
    );
  }

  getProductOverview(productId: string, days = 30): Observable<ProductOverview> {
    const params = new HttpParams().set('days', days);
    return this.http.get<ProductOverview>(
      `${API_BASE}/analytics/products/${productId}/overview`,
      { params }
    );
  }

  getProductSalesAnalytics(productId: string, days: number): Observable<ProductDailySale> {
    const params = new HttpParams().set('days', days);
    return this.http.get<ProductDailySale>(
      `${API_BASE}/analytics/products/${productId}/daily-sales`,
      { params }
    );
  }

  getProductPerformance(productId: string): Observable<ProductPerformanceData> {
    return this.http.get<ProductPerformanceData>(
      `${API_BASE}/analytics/products/${productId}/performance`
    );
  }

  getWeeklyCategorySales(days = 30): Observable<WeeklyCategorySales> {
    const params = new HttpParams().set('days', days);
    return this.http.get<WeeklyCategorySales>(
      `${API_BASE}/analytics/categories/weekly-sales`,
      { params }
    );
  }
}