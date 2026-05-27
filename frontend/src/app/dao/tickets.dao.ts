import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../dashboard/pending-tickets/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketsDao {
  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>('http://localhost:3000/ticket');
  }
}
