import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TicketDaoService } from '../dao/ticketdao.service';
import { ticket } from './ticket.model';

export type TicketFilter = 'PENDING' | 'APPROVED' | 'REJECTED';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private ticketDao: TicketDaoService) {}

  getAllTickets(): Observable<ticket[]> {
    return this.ticketDao.getTickets();
  }

  // NEW
  createTicket(productid: string, productName: string, requestedQuantity: number): Observable<ticket> {
    return this.ticketDao.createTicket(productid, productName, requestedQuantity);
  }

  updateSupplier(id: string, supplierId: string): Observable<ticket> {
    return this.ticketDao.patchTicket(id, { supplierId });
  }

  updateRequestedQuantity(id: string, requestedQuantity: number): Observable<ticket> {
    return this.ticketDao.patchTicket(id, { requestedQuantity });
  }

  updateTicketStatus(id: string, status: ticket['status']): Observable<ticket> {
    return this.ticketDao.patchTicket(id, { status });
  }

  approveTicket(ticketItem: ticket, expirydate: string, price: number): Observable<ticket> {
  return this.ticketDao.approveTicket(ticketItem.id, ticketItem.supplierId!, expirydate, price);
}

  disapproveTicket(ticketItem: ticket): Observable<{ message: string; ticket: ticket }> {
    return this.ticketDao.disapproveTicket(ticketItem.id) as Observable<{ message: string; ticket: ticket }>;
  }

  checkLowStock(): Observable<{ message: string }> {
    return this.ticketDao.checkLowStock();
  }

  filterTickets(tickets: ticket[], filter: TicketFilter): ticket[] {
    switch (filter) {
      case 'PENDING':  return tickets.filter(t => t.status === 'PENDING');
      case 'APPROVED': return tickets.filter(t => t.status === 'APPROVED');
      case 'REJECTED': return tickets.filter(t => t.status === 'REJECTED');
      default:         return tickets;
    }
  }
}