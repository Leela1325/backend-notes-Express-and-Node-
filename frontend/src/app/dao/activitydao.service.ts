import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityDaoService {
  private readonly baseUrl = 'http://localhost:4040/activity';

  constructor(private http: HttpClient) {}

  create(activity: Activity): Observable<Activity> {
    return this.http.post<Activity>(this.baseUrl, activity);
  }

  getAll(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.baseUrl);
  }
  updateActivity(eventname:string,eventdesc:string)
  {
    let timestamp=new Date().toISOString();
    return this.http.post(`http://localhost:4040/activity/log`,{
      eventname,eventdesc,timestamp
    },
  
);


  }

}
