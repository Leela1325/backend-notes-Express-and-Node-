import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { SalesDao } from '../dao/sales.dao';
import { ProductsDao } from '../dao/products.dao';
import { DailyRevenue } from '../dashboard/sales-chart/dailyRevenue.model';

@Injectable({
  providedIn: 'root',
})
export class TotalSalesService {
  constructor(
    private salesDao: SalesDao,
    private productsDao: ProductsDao,
  ) {}

  getDailyRevenue(daysCount: number = 30): Observable<DailyRevenue> {
    return forkJoin({
      sales: this.salesDao.getSales(),
      products: this.productsDao.getProducts(),
    }).pipe(
      map(({ sales, products }) => {
        const priceMap = new Map(
          products.map((p) => [p.id.toString(), p.price]),
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const cutOffDate = new Date();
        cutOffDate.setHours(0, 0, 0, 0);
        cutOffDate.setDate(today.getDate() - daysCount);

        const revenueMap: { [date: string]: number } = {};
        for (let i = 1; i <= daysCount; i++) {
          const date = new Date(cutOffDate);
          date.setDate(cutOffDate.getDate() + i);
          const dateStr = date.toLocaleDateString('en-IN', {
            month: 'short',
            day: '2-digit',
          });
          revenueMap[dateStr] = 0;
        }

        let totalSalesCount = 0;
        let totalQuantity = 0;

        sales.forEach((sale) => {
          const saleDate = new Date(sale.timestamp);
          saleDate.setHours(0, 0, 0, 0);

          if (saleDate > cutOffDate && saleDate <= today) {
            const dateStr = saleDate.toLocaleDateString('en-IN', {
              month: 'short',
              day: '2-digit',
            });
            const unitPrice = priceMap.get(sale.productid) || 0;
            const saleRevenue = unitPrice * sale.quantity;

            revenueMap[dateStr] = (revenueMap[dateStr] || 0) + saleRevenue;
            totalSalesCount++;
            totalQuantity += sale.quantity;
          }
        });

        const dates = Object.keys(revenueMap).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime(),
        );

        const revenue = dates.map((date) => revenueMap[date]);

        const totalRevenue = revenue.reduce((sum, val) => sum + val, 0);

        return {
          cutOffDate: today,
          dates,
          revenue,
          totalRevenue,
          totalSalesCount,
          totalQuantity,
        };
      }),
    );
  }
}