import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
import { env } from '../../../../env';
import { Category, CategoryWithDetails } from './category.model';
import { Zone } from '../zone-list/zone.model';
import { Product } from '../products-list/product.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  httpClient = inject(HttpClient);
  baseCategoryUrl = env.baseUrl + '/categories';
  baseZoneUrl = env.baseUrl + '/zones';
  baseProductUrl = env.baseUrl + '/products';

  getCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(this.baseCategoryUrl);
  }

  getCategoryByCategoryId(cid: string): Observable<Category> {
    return this.httpClient.get<Category>(`${this.baseCategoryUrl}/${cid}`);
  }

  getCategoryByZoneId(zoneid: string): Observable<Category[]> {
    return this.httpClient.get<Category[]>(
      `${this.baseCategoryUrl}?zoneid=${zoneid}`,
    );
  }

  getZoneById(zoneid: string): Observable<Zone> {
    return this.httpClient.get<Zone>(`${this.baseZoneUrl}/${zoneid}`);
  }

  getProductsByCategoryId(categoryid: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${this.baseProductUrl}?categoryid=${categoryid}`,
    );
  }

  // getCategoryWithDetails(
  //   zoneid?: string | null,
  // ): Observable<CategoryWithDetails[]> {
  //   const source = zoneid
  //     ? this.getCategoryByZoneId(zoneid)
  //     : this.getCategories();

  //   return source.pipe(
  //     mergeMap((categories: Category[]) => {
  //       const requests = categories.map((category) =>
  //         forkJoin({
  //           parentZone: this.getZoneById(category.zoneid),
  //           products: this.getProductsByCategoryId(category.id),
  //         }).pipe(
  //           map((result) => ({
  //             ...category,
  //             zoneName: result.parentZone.name,
  //             productCount: result.products.length,
  //           })),
  //         ),
  //       );
  //       return forkJoin(requests);
  //     }),
  //   );
  // }
  getCategoryWithDetails(
    zoneid?: string | null,
  ): Observable<CategoryWithDetails[]>{
    return this.httpClient.get<CategoryWithDetails[]>(`http://localhost:4040/categories?zoneid=${zoneid}`)
  }
}
