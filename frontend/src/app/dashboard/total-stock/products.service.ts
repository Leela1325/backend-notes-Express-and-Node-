import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { productSummary } from './productSummary.model';
@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  constructor(private http: HttpClient) {}
  private productStats$ = this.http.get<productSummary>('http://localhost:4040/dashboard/productSummary')
  getProducts() {
    return this.productStats$;
  }
}