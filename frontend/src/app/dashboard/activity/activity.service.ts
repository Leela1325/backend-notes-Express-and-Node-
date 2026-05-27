import { Injectable } from '@angular/core';
import { Activity } from './activity.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private http: HttpClient) {}
  getRecentActivity(days: number) {
    return this.http.get<{data: Activity[]}>(`http://localhost:4040/dashboard/recentActivity?days=${days}`);
  }
}
