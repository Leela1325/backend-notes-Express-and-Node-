import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from '../dashboard/expiring-products/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ZoneDisributionDao {
  http = inject(HttpClient);

  getProductsByZoneId(zoneId: string): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products', {
      params: { zoneid: zoneId },
    });
  }
}
