import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone } from '../dashboard/total-zones/zone.model';

@Injectable({
  providedIn: 'root',
})
export class ZonesDao {
  private apiUrl = 'http://localhost:3000/zone';

  constructor(private http: HttpClient) {}

  getZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.apiUrl);
  }
}
