import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockinoutService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4040/dashboard/stockInStockOut'; // change to your URL

  getStockInOut(): Observable<{
    dates: string[];
    stockIn: number[];
    stockOut: number[];
  }> {
    return this.http
      .get<{ dates: string[]; stockIn: number[]; stockOut: number[] }>(this.apiUrl)
      .pipe(
        map((data) => ({
          // Format ISO date strings → "12 Nov" style labels
          dates: data.dates.map((d) =>
            new Date(d).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            }),
          ),
          // Negate stockIn so bars go LEFT (diverging chart effect)
          stockIn: data.stockIn.map((n) => -n),
          stockOut: data.stockOut,
        })),
      );
  }
}