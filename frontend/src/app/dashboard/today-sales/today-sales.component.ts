import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TodaySalesService } from './today-sales.service';
import { DatePipe } from '@angular/common';

export interface sales  {
    totalSalesRevenue: number;
    totalQuantity: number;
    date: Date;
  } 
@Component({
  selector: 'app-today-sales',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './today-sales.component.html',
  styleUrl: './today-sales.component.scss',
})

export class TodaySalesComponent implements OnInit , OnDestroy {
  sales : sales = {
    totalSalesRevenue: 0,
    totalQuantity: 0,
    date: new Date(),
  }
  isloaded : boolean= false ;
  constructor(private todaySalesService : TodaySalesService ) {}
  subscription !: Subscription
  ngOnInit(): void {
   this.subscription =  this.todaySalesService.getTodaySalesSummary().subscribe( {next : (data) => {
   
    this.isloaded = true
    
    this.sales.totalSalesRevenue = data.totalRevenue ;
    this.sales.totalQuantity = data.totalQuantity ;
    this.sales.date = new Date(data.date) ;
   
   } ,
  error : (err) => {
    this.isloaded = false
   
  }})
  }
  ngOnDestroy(): void {
      this.subscription.unsubscribe() ;
  }
}
