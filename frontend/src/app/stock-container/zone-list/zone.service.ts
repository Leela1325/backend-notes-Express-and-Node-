import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
// import { env } from '../../../../../env';
import { env } from '../../../../env';
import { Zone, ZoneWithCounts } from './zone.model';
import { Category } from '../category-list/category.model';
import { Product } from '../products-list/product.model';

@Injectable({ providedIn: 'root' })
export class ZoneService {
  httpClient = inject(HttpClient);
  baseZoneUrl = env.baseUrl + '/zones';
  baseCategoryUrl = env.baseUrl + '/categories';
  baseProductUrl = env.baseUrl + '/products';

  getZones(): Observable<Zone[]> {
    return this.httpClient.get<Zone[]>(this.baseZoneUrl);
  }

  getZoneById(zoneid: string): Observable<Zone> {
    return this.httpClient.get<Zone>(`${this.baseZoneUrl}/${zoneid}`);
  }

  getCategoryByZoneId(zoneid: string): Observable<Category[]> {
    return this.httpClient.get<Category[]>(
      `${this.baseCategoryUrl}?zoneid=${zoneid}`,
    );
  }

  getProductsByZoneid(zoneid: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `${this.baseProductUrl}?zoneid=${zoneid}`,
    );
  }

  // getZoneWithCounts(): Observable<ZoneWithCounts[]> {
  //   return this.getZones().pipe(
  //     mergeMap((zones) => {
  //       const requests = zones.map((zone) =>
  //         forkJoin({
  //           categories: this.getCategoryByZoneId(zone.id),
  //           products: this.getProductsByZoneid(zone.id),
  //         }).pipe(
  //           map((result) => ({
  //             ...zone,
  //             categoryCount: result.categories.length,
  //             productCount: result.products.length,
  //             status: 'Active',
  //           })),
  //         ),
  //       );
  //       return forkJoin(requests);
  //     }),
  //   );
  // }
  getZoneWithCounts(): Observable<ZoneWithCounts[]> {
  return this.httpClient.get<ZoneWithCounts[]>("http://localhost:4040/zones");
}
}
