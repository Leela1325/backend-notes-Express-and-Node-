import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductDaoService {
  private apiUrl = 'http://localhost:4040/products/ticket';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductByName(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?name=${name}`);
  }
  getProductById(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: string, payload: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, payload);
  }
  getProductsByZoneAndCategory(
  zoneId: string,
  categoryId: string
): Observable<Product[]> {
  return this.http.get<Product[]>(
    `${this.apiUrl}?zoneid=${zoneId}&categoryid=${categoryId}`
  );
}
}
