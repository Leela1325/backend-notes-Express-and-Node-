// import { inject, Injectable } from '@angular/core';

// import { map, mergeMap, toArray } from 'rxjs/operators';
// import { BehaviorSubject, forkJoin, from } from 'rxjs';
// import { ProductSupplierService } from '../supplier-container/supplier-list/supplier/product-supplier.service';
// import {
//   Supplier,
//   SupplierWithProducts,
//   SupplierWithoutId,
// } from '../supplier-container/supplier-list/supplier/supplier.model';
// import { HttpClient } from '@angular/common/http';
// import { env } from '../../../env';
// @Injectable({
//   providedIn: 'root',
// })
// export class SupplierDaoService {
//   http = inject(HttpClient);
//   baseurl = env.baseUrl + '/supplier';

//   productService = inject(ProductSupplierService);

//   getSuppliersBhSubject = new BehaviorSubject<Supplier[]>([]);
//   getSuppliersBhSubject$ = this.getSuppliersBhSubject.asObservable();

//   getSuppliers() {
//     if (this.getSuppliersBhSubject.value.length > 0) return;
//     return this.http
//       .get<Supplier[]>(this.baseurl)
//       .subscribe((data) => this.getSuppliersBhSubject.next(data));
//   }

//   getSuppliersByZoneId(zoneid: string) {
//     return this.http.get<Supplier[]>(`${this.baseurl}?zoneid=${zoneid}`);
//   }

//   getSuppliersByCategoryId(categoryId: string, zone: string) {
//     return this.http
//       .get<
//         Supplier[]
//       >(`${this.baseurl}?categoryid=${categoryId}&zoneid=${zone}`)
//       .pipe(
//         mergeMap((data) =>
//           from(data).pipe(
//             mergeMap((supplier) =>
//               forkJoin({
//                 products: this.productService.getProductsBySupplierId(
//                   supplier.id,
//                   categoryId,
//                   zone,
//                 ),
//               }).pipe(
//                 map((extradata) => ({
//                   ...supplier,
//                   products: extradata.products,
//                 })),
//               ),
//             ),
//             toArray(),
//           ),
//         ),
//       );
//   }

//   updateSupplierDetails(id: string, data: SupplierWithoutId) {
//     return this.http.put(`${this.baseurl}/${id}`, data, {
//       headers: {
//         'content-type': 'application/json',
//         accept: 'application/json',
//       },
//     });
//   }

//   addSupplier(data: SupplierWithoutId) {
//     return this.http.post<Supplier>(this.baseurl, data, {
//       headers: {
//         'Content-Type': 'application/json',
//         accept: 'application/json',
//       },
//     });
//   }

//   calculateRating(id: string, rating: number) {
//     let current_rating = -1;
//     let subs = this.http
//       .get<Supplier>(this.baseurl + '/' + id)
//       .subscribe((supplier) => {
//         current_rating = supplier.rating;
//         this.calculateRatingWithCurrent(
//           id,
//           (current_rating + rating) / 6,
//         ).subscribe();
//       });
//   }
//   calculateRatingWithCurrent(id: string, rating: number) {
//     return this.http.patch(
//       this.baseurl + '/' + id,
//       { rating },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );
//   }

//   DeleteSupplierById(id: string) {
//     console.log(id);
//     return this.http.delete(this.baseurl + '/' + id);
//   }

//   searchName(
//     supplier: SupplierWithProducts[],
//     searchvalue: string,
//   ): SupplierWithProducts[] {
//     if (!searchvalue.trim()) {
//       return supplier;
//     }

//     return supplier
//       .map((eachsupplier: SupplierWithProducts) => ({
//         ...eachsupplier,
//         products: eachsupplier.products.filter((product) =>
//           product.name.toLowerCase().startsWith(searchvalue.toLowerCase()),
//         ),
//       }))
//       .filter((eachsupplier) => eachsupplier.products.length > 0);
//   }

//   getOptimalSuppliersList(categoryId: string | null) {
//     let supplierArray: Supplier[] = [];
//     return this.http
//       .get<Supplier[]>(`${this.baseurl}?categoryid=${categoryId}`)
//       .pipe(
//         map((suppliers) => {
//           return (supplierArray = suppliers.sort(
//             (supplier1, supplier2) => supplier2.rating - supplier1.rating,
//           ));
//         }),
//       );
//   }
//   getOptimalSuppliersListForTicket(productId: string) {
//     let supplierArray: Supplier[] = [];
//     this.http.get<Supplier[]>(`${this.baseurl}?productid=${productId}`).pipe(
//       map((suppliers) => {
//         supplierArray = suppliers.sort(
//           (supplier1, supplier2) => supplier2.rating - supplier1.rating,
//         );
//       }),
//     );
//   }

//   updateActivity(eventname: string, eventdesc: string) {
//     let timestamp = new Date().toISOString();
//     return this.http.post(
//       `${this.baseurl}`,
//       {
//         eventname,
//         eventdesc,
//         timestamp,
//       },
//       {
//         headers: {
//           'content-type': 'application/json',
//           accept: 'application/json',
//         },
//       },
//     );
//   }

//   getSupplierByProductId(id: string) {
//     return this.http.get<Supplier[]>(`${this.baseurl}?productid=${id}`);
//   }

//   getSupplierById(supplierid: string) {
//     return this.http.get<Supplier>(this.baseurl + '/' + supplierid);
//   }

//   matchSupplierWithProduct(productid: string, supplierid: string) {
//     this.getSupplierById(supplierid).subscribe({
//       next: (supplier) => {
//         let supplierarray = [...supplier.productid, productid];
//         this.http
//           .patch(
//             this.baseurl + '/' + supplierid,
//             { productid: supplierarray },
//             {
//               headers: {
//                 'content-type': 'application/json',
//               },
//             },
//           )
//           .subscribe();
//       },
//     });
//   }
// }
