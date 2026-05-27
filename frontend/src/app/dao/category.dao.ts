import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Category } from '../dashboard/zone-distribution-chart/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryDao {
  http = inject(HttpClient);
  getCategory() {
    return this.http.get<Category[]>('http://localhost:3000/category');
  }
  getCategoryByZoneId(zoneid: string) {
    return this.http.get<Category[]>('http://localhost:3000/category', {
      params: { zoneid: zoneid },
    });
  }
}
