import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ExpiringProductsService,
  ExpiringProductSummary,
} from './expiring-products.service';
import { Product } from './product.model';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpiringProduct } from './expiring-products.model';

@Component({
  selector: 'app-expiring-products',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './expiring-products.component.html',
  styleUrl: './expiring-products.component.scss',
})
export class ExpiringProductsComponent implements OnInit, OnDestroy {
  expiringData!: ExpiringProductSummary;
  isLoaded: boolean = false;
  selectedRange = 7;
  subscription!: Subscription;
  constructor(private expService: ExpiringProductsService) {}

  ngOnInit(): void {
    this.subscription = this.expService
      .getExpiringProducts(this.selectedRange)
      .subscribe({
        next: (data) => {
          this.expiringData = data;
          this.isLoaded = true;
        },
        error: (err) => {
          this.isLoaded = false;
        },
      });
  }
  onRangeChange() {
    this.subscription = this.expService
      .getExpiringProducts(this.selectedRange)
      .subscribe( {next : (data) => {
        this.expiringData = data;
        this.isLoaded = true;
      } , 
      error : (err) => {
        this.isLoaded = false;
      }});
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
