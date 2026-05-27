import { inject, Injectable } from '@angular/core';

import { catchError, filter, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { ProductSupplierService } from './product-supplier.service';
import {
  Supplier,
  SupplierWithoutId,
  SupplierWithProducts,
} from './supplier.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { env } from '../../../../../env';
import { Product } from './product.model';
import { ProductService } from '../../../stock-container/products-list/product.service';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  http = inject(HttpClient);
  baseurl = env.baseUrl + '/suppliers';

  productService = inject(ProductSupplierService);
  productMainService=inject(ProductService);

  getSuppliersBhSubject = new BehaviorSubject<Supplier[]>([]);
  getSuppliersBhSubject$ = this.getSuppliersBhSubject.asObservable();

  getSuppliers() {
    if (this.getSuppliersBhSubject.value.length > 0) return;
    return this.http
      .get<Supplier[]>(this.baseurl)
      .subscribe((data) => this.getSuppliersBhSubject.next(data));
  }

  // getSuppliersByZoneId(zoneid: string) {
  //   return this.http.get<Supplier[]>(`${this.baseurl}?zoneid=${zoneid}`);
  // }
  getSuppliersByCategoryId(categoryId: string|null, zone: string|null) {
  return this.http
    .get<SupplierWithProducts[]>(`http://localhost:4040/suppliers?categoryid=${categoryId}&zoneid=${zone}`)
    
}

  updateSupplierDetails(id: string, data: SupplierWithoutId) {
    return this.http.put(`http://localhost:4040/suppliers/`+id, data, {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    });
  }

  addSupplier(data: SupplierWithoutId) {
    return this.http.post<Supplier>('http://localhost:4040/suppliers', data, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });
  }

  calculateRating(id: string, rating: number) {
    let current_rating = -1;
    let subs = this.http
      .get<Supplier>('http://localhost:4040/suppliers' + '/' + id)
      .subscribe((supplier) => {
        current_rating = supplier.rating;
        this.calculateRatingWithCurrent(
          id,
          (current_rating + rating) / 6,
        ).subscribe();
      });
  }
  calculateRatingWithCurrent(id: string, rating: number) {
    return this.http.patch(
      'http://localhost:4040/suppliers'+ '/' + id+'/updaterating',
      { rating },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  DeleteSupplierById(id: string) {
   
    return this.http.delete('http://localhost:4040/suppliers' + '/' + id);
  }

  searchName(
    supplier: SupplierWithProducts[],
    searchvalue: string,
  ): SupplierWithProducts[] {
    if (!searchvalue.trim()) {
      return supplier;
    }
    searchvalue=searchvalue.trim();
    return supplier
      .map((eachsupplier: SupplierWithProducts) => ({
        ...eachsupplier,
        products: eachsupplier.products.filter((product) =>
          product.name.toLowerCase().includes(searchvalue.toLowerCase()),
        ),
      }))
      .filter((eachsupplier) => eachsupplier.products.length > 0);
  }



getOptimalSuppliersListForTicket(productId: string){
  return this.http.get<Product>("http://localhost:4040/suppliers/optimal?productid=" + productId);
}

  

  getSupplierById(supplierid: string) {
    return this.http.get<Supplier>('http://localhost:4040/suppliers' + '/' + supplierid);
  }


 matchSupplierWithProduct(productid: string, supplierids: string[]) {
    let params=new HttpParams();
    params=params.append('productid',productid);
    supplierids.forEach((id)=>{
      params=params.append('supplierids',id);
    })

    this.http.patch('http://localhost:4040/suppliers/sup_pro_match',{},{
      params,
      headers:{
        'content-type':'application/json'
      }
    }).subscribe();

}
 


removeProductFromSuppliers(productId: string, supplierIds: string[]) {

    let body={
      productid:productId,
      supplierids:supplierIds

    }
      
      this.http.patch(
        `http://localhost:4040/suppliers/sup_pro_remove_product`,
        body,
        { headers: { 'content-type': 'application/json' } }
      ).subscribe();

 
  }

 
getProductsById(ids: string[], categoryId: string, zone: string) {
 
    let params=new HttpParams();
    ids.forEach((id)=>{
      params=params.append('ids',id);
    })
    this.http.get('http://localhost:4040/suppliers/getproducts',{
      params
    })
} 



  


   removeSupplierFromProducts( supplierId: string,productIds: string[]) {

    let body={
      productids:productIds,
      supplierid:supplierId
    };

    return this.http.patch('http://localhost:4040/suppliers/sup_pro_remove_supplier',body,{
      headers:{
        'content-type':'application/json'
      }
    })

      }


   
      


      

getAllSuppliersPurchaseFeedback(supplierids: string) {
  return this.http.get<any>(`http://localhost:4040/suppliers/all-purchase-feedback?supplierids=${supplierids}`);
}
}

