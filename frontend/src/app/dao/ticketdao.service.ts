import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ticket } from '../ticket/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketDaoService {
  private apiUrl = 'http://localhost:4040/tickets';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<ticket[]> {
    return this.http.get<ticket[]>(this.apiUrl);
  }

  getTicketById(id: string): Observable<ticket> {
    return this.http.get<ticket>(`${this.apiUrl}/${id}`);
  }

  // UPDATED — takes individual fields instead of full ticket object
  // so the backend gets exactly { productid, productName, requestedQuantity }
  createTicket(productid: string, productName: string, requestedQuantity: number): Observable<ticket> {
    return this.http.post<ticket>(this.apiUrl, { productid, productName, requestedQuantity });
  }

  patchTicket(id: string, partialTicket: Partial<ticket>): Observable<ticket> {
    return this.http.patch<ticket>(`${this.apiUrl}/${id}`, partialTicket);
  }

  approveTicket(id: string, supplierId: string, expirydate: string, price: number): Observable<ticket> {
  return this.http.post<ticket>(`${this.apiUrl}/${id}/approve`, {
    supplierId,
    expirydate,
    price,   
  });
}

  disapproveTicket(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/disapprove`, {});
  }

  checkLowStock(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/check-stock`, {});
  }
}