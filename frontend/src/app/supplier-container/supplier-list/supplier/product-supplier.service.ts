import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../../env';
import { Product } from './product.model';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductSupplierService {
  http = inject(HttpClient);
  baseurl = env.baseUrl + '/products';

  getProductsBySupplierId(id: string, categoryId: string, zoneId: string) {
  return this.http.get<Product[]>(
    `http://localhost:5000/suppliers/getproductsbysupplierid?supplierid=`+id,
  )
  }
}
