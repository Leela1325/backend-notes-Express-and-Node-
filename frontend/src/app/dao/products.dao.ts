import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../dashboard/expiring-products/product.model';
@Injectable({
  providedIn: 'root',
})
export class ProductsDao {
  constructor(private http: HttpClient) {}
  getProducts() {
    return this.http.get<Product[]>('http://localhost:3000/products');
  }
}
