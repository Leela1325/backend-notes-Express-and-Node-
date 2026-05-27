import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from '../dashboard/today-sales/sales.model';

@Injectable({
  providedIn: 'root',
})
export class SalesDao {
  constructor(private http: HttpClient) {}

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>('http://localhost:4040/sales');
  }
}
