import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface ZoneDistributionResponse {
  categoryName: string[];
  distribution: number[];
}

@Injectable({ providedIn: 'root' })
export class ZoneDistributionChartService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4040/dashboard'; // change to your URL

  getZones(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.baseUrl}/zones`);
  }

  getZoneDistribution(zoneid: string): Observable<ZoneDistributionResponse> {
    return this.http
      .get<{ categoryName: string; percentage: number }[]>(
        `${this.baseUrl}/getCategoryDistrubitionByZoneId?zoneid=${zoneid}`,
      )
      .pipe(
        map((data) => ({
          categoryName: data.map((d) => d.categoryName),
          distribution: data.map((d) => d.percentage),
        })),
      );
  }
}