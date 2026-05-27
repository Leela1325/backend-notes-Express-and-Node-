import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone } from '../models/zone.model';

@Injectable({
  providedIn: 'root',
})
export class ZonedaoService {
  private baseZoneUrl = 'http://localhost:4040/zones/ticket';

  constructor(private http: HttpClient) {}

  getAllZones(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.baseZoneUrl);
  }

  getZoneById(id: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.baseZoneUrl}/${id}`);
  }
}