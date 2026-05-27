import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ticket } from './ticket.model';
export interface ticketSummary {
  count : number ,
  tickets : Ticket []
}
@Injectable({
  providedIn: 'root',
})

export class TicketsService {
  constructor (private http : HttpClient) {}
  private pendingTickets$ = this.http.get<ticketSummary>("http://localhost:4040/dashboard/ticketSummary")

  

  getPendingTickets() {
    return this.pendingTickets$;
  }
}