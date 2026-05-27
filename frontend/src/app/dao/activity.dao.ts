import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../dashboard/activity/activity.model';

@Injectable({
  providedIn: 'root',
})
export class RecentActivityDao {
  constructor(private http: HttpClient) {}

  getRecentActivity(): Observable<Activity[]> {
    return this.http.get<Activity[]>('http://localhost:3000/activity');
  }
}
