
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { sales } from './sales.model';
import { SalesdaoService } from '../dao/salesdao.service';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  constructor(private salesDao: SalesdaoService) {}

  getAllSales(): Observable<sales[]> {
    return this.salesDao.getsales();
  }

  submitSale(newSale: sales): Observable<sales> {
    
    return this.salesDao.addSale(newSale);
  }

  filterSales(
    salesList: sales[],
    filter: 'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
  ): sales[] {
    const now = new Date();

    return salesList.filter((sale) => {
      const saleDate = new Date(sale.timestamp);

      switch (filter) {
        case 'DAILY':
          return this.isSameDay(saleDate, now);
        case 'WEEKLY':
          return this.isSameWeek(saleDate, now);
        case 'MONTHLY':
          return this.isSameMonth(saleDate, now);
        default:
          return true;
      }
    });
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  private isSameWeek(d1: Date, d2: Date): boolean {
    const start = new Date(d2);
    start.setDate(d2.getDate() - d2.getDay());
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return d1 >= start && d1 <= end;
  }

  private isSameMonth(d1: Date, d2: Date): boolean {
    return (
      d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
    );
  }
}