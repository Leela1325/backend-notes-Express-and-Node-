import { inject, Injectable } from '@angular/core';
import { mergeMap, from, forkJoin, map, toArray, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { CategoryService } from '../../category-list/category/category.service';
import { SupplierService } from '../../supplier-list/supplier/supplier.service';
import { Zone, ZoneWithSupplierAndCategories } from './zone.model';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../../env';

@Injectable({
  providedIn: 'root',
})
export class ZoneService {
  http = inject(HttpClient);
  baseurl = env.baseUrl+ '/zone';

  private categoryService = inject(CategoryService);
  private supplierService = inject(SupplierService);

  private getZonesBhSubject = new BehaviorSubject<
    ZoneWithSupplierAndCategories[]
  >([]);
  getZonesBhSubject$ = this.getZonesBhSubject.asObservable();

 getZones(): void {
  if (this.getZonesBhSubject.value.length > 0) return;

  this.http
    .get<ZoneWithSupplierAndCategories[]>('http://localhost:4040/zones/zone-supplier')
    .subscribe((finaldata) => {
      this.getZonesBhSubject.next(finaldata);
    });
}

  getZone(zoneid: string) {
    return this.http.get<Zone>('http://localhost:4040/zones/zone-supplier/' + zoneid);
  }
}
