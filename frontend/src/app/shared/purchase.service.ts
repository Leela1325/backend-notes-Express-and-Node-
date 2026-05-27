import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseDaoService } from '../dao/purchasedao.service';
import { Purchase } from '../models/purchase.model';
@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  constructor(private purchaseDao: PurchaseDaoService) {}


  createPurchase(productid: string, quantity: number): Observable<Purchase> {
    const purchase: Purchase = {
      productid,
      quantity,
      timestamp: new Date().toISOString(),
      id: '',
    };

    return this.purchaseDao.addPurchase(purchase);
  }
}
