import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Purchase } from '../dashboard/stockinout/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class PurchaseDao {
  constructor(private http: HttpClient) {}

  getPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>('http://localhost:3000/purchase');
  }
}
