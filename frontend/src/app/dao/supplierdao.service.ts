import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Supplier } from '../models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierDaoService {
  private baseUrl = 'http://localhost:4040/suppliers/ticket';

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl);
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.baseUrl}/${id}`);
  }

  getSuppliersByIds(ids: string[]): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl).pipe(
      map(suppliers => suppliers.filter(s => ids.includes(s.id)))
    );
  }
}
