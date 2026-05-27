import { Injectable } from '@angular/core';
import { ActivityDaoService } from '../dao/activitydao.service';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private activitydao: ActivityDaoService) {}

  logTicketApproved(
    ticketId: string,
    productName: string,
    quantity: number,
  ): void {
    const activity: Activity = {
      eventname: 'Ticket Approved',
      eventdesc: `Ticket ${ticketId} approved for ${quantity} units of ${productName}`,
      timestamp: new Date().toISOString(),
    };

    this.activitydao.create(activity).subscribe();
  }

  logTicketDisapproved(ticketId: string): void {
    const activity: Activity = {
      eventname: 'Ticket Disapproved',
      eventdesc: `Ticket ${ticketId} was disapproved`,
      timestamp: new Date().toISOString(),
    };

    this.activitydao.create(activity).subscribe();
  }

  logSaleSubmitted(
    productName: string,
    category: string,
    quantity: number,
  ): void {
    const activity: Activity = {
      eventname: 'Sale Submitted',
      eventdesc: `${quantity} units sold for ${productName} (${category})`,
      timestamp: new Date().toISOString(),
    };

    this.activitydao.create(activity).subscribe();
  }

  




}
