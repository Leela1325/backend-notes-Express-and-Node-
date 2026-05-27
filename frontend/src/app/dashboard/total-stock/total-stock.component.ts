import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductsService } from './products.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-total-stock',
  standalone: true,
  imports: [],
  templateUrl: './total-stock.component.html',
  styleUrl: './total-stock.component.scss',
})
export class TotalStockComponent implements OnInit,OnDestroy{
  quantity !: number 
  products !: number 
  isLoaded : boolean = false ;
  constructor(private productService: ProductsService) {}
  subscription !: Subscription
  ngOnInit(): void {
    this.subscription = this.productService.getProducts().subscribe({
      next: (data) => {
       
        this.quantity = data.quantity;
        this.products = data.products;
        this.isLoaded = true ;
      },
    });
  }
  ngOnDestroy(): void {
      this.subscription.unsubscribe() ;
  }
}
