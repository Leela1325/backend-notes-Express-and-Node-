import { Injectable } from '@angular/core';
import { ProductsDao } from '../../dao/products.dao';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from './product.model';
import { ExpiringProduct } from './expiring-products.model';
import { HttpClient } from '@angular/common/http';
// A flattened row: one batch of one product, ready to show in the UI
export interface ExpiringProductSummary {
  count : number 
  expiringItems : ExpiringProduct []
}


@Injectable({
  providedIn: 'root',
})
export class ExpiringProductsService {
  constructor(private http : HttpClient) {}
  getExpiringProducts(days: number) {
    return this.http.get<ExpiringProductSummary>(`http://localhost:4040/dashboard/expiringProducts?days=${days}`);
  }

}