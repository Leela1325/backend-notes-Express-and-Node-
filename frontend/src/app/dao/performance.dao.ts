import { inject, Injectable, signal } from "@angular/core";
import {
  baseUrl,
  Category,
  Product,
  Sale
} from "../performance/sales.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PerformanceDao {

  private http = inject(HttpClient);

  getAllCategories():Observable<Category[]> {
    return this.http.get<Category[]>(baseUrl+'/category');
  }

  getAllProductsNames(): Observable<Product[]> {
    return this.http.get<Product[]>(baseUrl+'/products');
  }

  getCategoryAnalytics(category: string): Observable<Sale[]> {
    const params = new HttpParams().set('category',category);
    return this.http.get<Sale[]>(baseUrl+'/sales',{
      params
    })
  }

  getSalesByCategory(category:string):Observable<Sale[]> {
    return this.http.get<Sale[]>(baseUrl+'/sales',{
      params: new HttpParams().set('category',category)
    });
  }

  getSalesByProductId(productId: string):Observable<Sale[]>{
    return this.http.get<Sale[]>(baseUrl+'/sales',{
      params: new HttpParams().set('productid',productId)
    })
  }

  getAllProducts():Observable<Product[]> {
    return this.http.get<Product[]>(baseUrl+'/products');
  }

  getWeeklyCategorySales(days =  30): Observable<{
      categories: string[];
      series: { name: string; data: number[] }[];
    }> {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - days + 1);

      const dayLabels:string[]=[];
      for (let i = 0; i < days; i++) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + i);
        dayLabels.push(d.toLocaleDateString('en-GB', {
           day: '2-digit', month: days<=15? 'short' : 'narrow',
          }));
      }
      return this.http.get<Sale[]>(`${baseUrl}/sales`).pipe(
        map(sales => {
          const categoryDayMap: Record<string, number[]> = {};

          sales.forEach(sale => {
            const saleDate = new Date(sale.timestamp);
            if (saleDate < fromDate || saleDate > toDate) return;

            const dayIndex = Math.floor(
              (saleDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (!categoryDayMap[sale.category]) {
              categoryDayMap[sale.category] = Array(days).fill(0);
            }

            categoryDayMap[sale.category][dayIndex] += sale.quantity;
          });

          return {
            categories: dayLabels,
            series: Object.entries(categoryDayMap).map(([category, data]) => ({
              name: category,
              data
            }))
          };
        })
      );
    }
}