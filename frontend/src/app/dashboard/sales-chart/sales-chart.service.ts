import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyRevenue } from './dailyRevenue.model';

@Injectable({ providedIn: 'root' })
export class SalesChartService {
  private apiUrl = 'http://localhost:4040/dashboard/salesSummary'; // change to your URL

  constructor(private http: HttpClient) {}

  getDailyRevenue(days: number): Observable<DailyRevenue> {
    return this.http.get<DailyRevenue>(`${this.apiUrl}?days=${days}`);
  }
}