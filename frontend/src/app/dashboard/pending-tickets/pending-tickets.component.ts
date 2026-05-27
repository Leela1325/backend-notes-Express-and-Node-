import { Component, OnDestroy, OnInit } from '@angular/core';
import { Ticket } from './ticket.model';
import { TicketsService } from './tickets.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ticketSummary } from './tickets.service';
@Component({
  selector: 'app-pending-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-tickets.component.html',
  styleUrl: './pending-tickets.component.scss',
})
export class PendingTicketsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  constructor(private ticketsService: TicketsService) {}
  isLoaded: boolean = false;
  ticketsData!: ticketSummary;
  ngOnInit(): void {
    this.subscription = this.ticketsService.getPendingTickets().subscribe({
      next: (data) => {
        this.ticketsData = data;
        this.isLoaded = true;
      },
      error: (err) => {
        this.isLoaded = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
