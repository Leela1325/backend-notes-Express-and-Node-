import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { sales } from '../sales/sales.model';

@Injectable({
  providedIn: 'root',
})
export class SalesdaoService {
  private url = 'http://localhost:4040/sales';
  constructor(private http: HttpClient) {}
  getsales(): Observable<sales[]> {
    return this.http.get<sales[]>(this.url);
  }

  addSale(sale: sales): Observable<sales> {
    return this.http.post<sales>(this.url, sale);
  }
}
