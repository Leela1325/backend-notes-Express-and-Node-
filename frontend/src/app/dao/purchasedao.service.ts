import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Purchase } from '../models/purchase.model';
@Injectable({
  providedIn: 'root',
})
export class PurchaseDaoService {
  private readonly baseUrl = 'http://localhost:4040/purchase';

  constructor(private http: HttpClient) {}

  addPurchase(purchase: Purchase): Observable<Purchase> {
    return this.http.post<Purchase>(this.baseUrl, purchase);
  }

  
}
``;
