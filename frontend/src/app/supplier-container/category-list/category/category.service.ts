import { inject, Injectable } from '@angular/core';

import { mergeMap, from, forkJoin, map, toArray, catchError, of, tap } from 'rxjs';
import { SupplierService } from '../../supplier-list/supplier/supplier.service';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../../env';
import { Category } from './category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  baseurl = env.baseUrl + '/category';

  supplierService = inject(SupplierService);
  // getCategories() {
  //   return this.http.get<Category[]>(this.baseurl);
  // }

  // getCategoryById(id: string) {
  //   return this.http.get<Category>(this.baseurl + '/' + id);
  // }

  getCategoriesByZoneId(zoneid: string) {
      console.log('zoneid passed in:', zoneid); //
  return this.http.get<any>('http://localhost:4040/categories/category-supplier'+`?zoneid=${zoneid}`)
}
}
