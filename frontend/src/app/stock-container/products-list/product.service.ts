import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';
import { env } from '../../../../env';
import { Product, ProductWithNames } from './product.model';
import { Zone } from '../zone-list/zone.model';
import { Category } from '../category-list/category.model';
// import { Supplier } from '../../../core/dao/supplier.model';
// import { Supplier } from '../../../core/models/supplier.model';
import { Supplier } from '../../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  httpClient = inject(HttpClient);
  baseProductUrl = env.baseUrl + '/products';
  baseZoneUrl = env.baseUrl + '/zones';
  baseCategoryUrl = env.baseUrl + '/categories';
  baseSupplierUrl = env.baseUrl + '/suppliers';

  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>("http://localhost:4040/products");
  }

  getProductsById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`http://localhost:4040/products/${id}`);
  }

  getProductsByZoneid(zoneid: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `http://localhost:4040/products?zoneid=${zoneid}`,
    );
  }

  getProductsByCategoryId(categoryid: string): Observable<Product[]> {
    return this.httpClient.get<Product[]>(
      `http://localhost:4040/products?categoryid=${categoryid}`,
    );
  }

  // addProduct(productData: Product): Observable<Product> {
  //   return this.httpClient.post<Product>(this.baseProductUrl, productData);
  // }
addProduct(productData: Product): Observable<Product> {
    return this.httpClient.post<Product>("http://localhost:4040/products",productData);
  }
  // updateProduct(id: string, productData: any): Observable<Product> {
  //   return this.httpClient.patch<Product>(
  //     `${this.baseProductUrl}/${id}`,
  //     productData,
  //   );
  // }
updateProduct(id: string, productData: any): Observable<Product> {
    return this.httpClient.patch<Product>(
      `http://localhost:4040/products/${id}`,
      productData,
    );
  }
  // deleteProduct(id: string): Observable<void> {
  //   return this.httpClient.delete<void>(`${this.baseProductUrl}/${id}`);
  // }
  deleteProduct(id: string): Observable<void> {
    return this.httpClient.delete<void>(`http://localhost:4040/products/${id}`);
  }
  // deleteBatch(productId: string, batchIndex: number): Observable<{ message: string; product: ProductWithNames }> {
  //   return this.httpClient.delete<{ message: string; product: ProductWithNames }>(`http://localhost:4040/products/${productId}/batch/${batchIndex}`);
  // }
deleteBatch(productId: string, batchId: string): Observable<any> {
  return this.httpClient.delete(`http://localhost:4040/products/${productId}/batch/${batchId}`);
}
  getZoneById(zoneid: string): Observable<Zone> {
    return this.httpClient.get<Zone>(`${this.baseZoneUrl}/${zoneid}`);
  }

  getCategoryByCategoryId(categoryid: string): Observable<Category> {
    return this.httpClient.get<Category>(
      `${this.baseCategoryUrl}/${categoryid}`,
    );
  }

  getSupplierBySupplierId(supplierid: string): Observable<Supplier> {
    return this.httpClient.get<Supplier>(
      `${this.baseSupplierUrl}/${supplierid}`,
    );
  }

  // getProductsWithNames(
  //   categoryid?: string | null,
  // ): Observable<ProductWithNames[]> {
  //   const source = categoryid
  //     ? this.getProductsByCategoryId(categoryid)
  //     : this.getProducts();

  //   return source.pipe(
  //     mergeMap((products: Product[]) => {
  //       const requests = products.map((product) =>
  //         forkJoin({
  //           zone: this.getZoneById(product.zoneid),
  //           category: this.getCategoryByCategoryId(product.categoryid),
           
  //         }).pipe(
  //           map((result) => ({
  //             ...product,
  //             zoneName: result.zone.name,
  //             categoryName: result.category.name,
  //           })),
  //         ),
  //       );
  //       return forkJoin(requests);
  //     }),
  //   );
  // }
    getProductsWithNames(
    categoryid?: string | null,
  ): Observable<any> {
    return this.httpClient.get(`http://localhost:4040/products?categoryid=${categoryid}`)
  }
}
