import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../../../../../env';
import { ActivityDaoService } from '../../../dao/activitydao.service';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  http = inject(HttpClient);
  activityDao = inject(ActivityDaoService);
  baseurl = 'http://localhost:4040' + '/activity/log';

  updateActivity(eventname: string, eventdesc: string) {
    //   let timestamp=new Date().toISOString();
    //   return this.http.post(`${this.baseurl}`,{
    //     eventname,eventdesc,timestamp
    //   },
    // {
    //   headers:{
    //     'content-type':'application/json',
    //     accept:'application/json'
    //   }
    // });
    return this.activityDao.updateActivity(eventname, eventdesc);
  }
}
