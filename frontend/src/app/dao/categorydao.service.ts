import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategorydaoService {
  baseProductUrl: string = 'http://localhost:4040/products/ticket';
  baseCategoryUrl: string = 'http://localhost:4040/categories/ticket';
  constructor(private httpClient: HttpClient) {}
  getCategoriesByZone(zoneId: string): Observable<Category[]> {
  return this.httpClient.get<Category[]>(
    `${this.baseCategoryUrl}?zoneid=${zoneId}`
  );
}
  getCategoryNameByProductName(productName: string): Observable<string> {
    return this.httpClient
      .get<Product[]>(this.baseProductUrl, {
        params: new HttpParams().set('name', productName),
      })
      .pipe(
        switchMap((products) => {
          if (products && products.length > 0) {
            const categoryid = products[0].categoryid;
            return this.httpClient.get<Category>(
              `${this.baseCategoryUrl}/${categoryid}`,
            );
          } else {
            return throwError(
              () => new Error('Product not found in the database.'),
            );
          }
        }),
        map((category) => category.name),
      );
  }
}
