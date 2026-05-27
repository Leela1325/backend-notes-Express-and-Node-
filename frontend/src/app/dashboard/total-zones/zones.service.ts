import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface zonesSummary {
  totalZones : number ;
  totalMaximumCapacity : number ;
  totalCurrentCapacity : number ;
  totalAvailableCapacity : number ;

}
@Injectable({
  providedIn: 'root',
})
export class ZonesService {
  constructor( private http: HttpClient) {}
  private zoneStats$ = this.http.get<zonesSummary>("http://localhost:4040/dashboard/zonesSummary")
  getZoneStats() {
    return this.zoneStats$;
  }
}
