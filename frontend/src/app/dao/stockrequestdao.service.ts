import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ticket } from '../ticket/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class StockRequestDaoService {

  private apiUrl = 'http://localhost:4040/tickets';

  constructor(private http: HttpClient) {}

  createRequest(payload: ticket): Observable<ticket> {
    return this.http.post<ticket>(this.apiUrl, payload);
  }

  getAllTickets(): Observable<ticket[]> {
    return this.http.get<ticket[]>(this.apiUrl);
  }

  updateTicket(id: string, payload: Partial<ticket>): Observable<ticket> {
    return this.http.patch<ticket>(`${this.apiUrl}/${id}`, payload);
  }
}