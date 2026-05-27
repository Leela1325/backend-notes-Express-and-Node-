import { Component, ViewChild } from '@angular/core';
import { TotalStockComponent } from './total-stock/total-stock.component';
import { TodaySalesComponent } from './today-sales/today-sales.component';
import { TotalZonesComponent } from './total-zones/total-zones.component';
import { PendingTicketsComponent } from './pending-tickets/pending-tickets.component';
import { ExpiringProductsComponent } from './expiring-products/expiring-products.component';
import { ActivityComponent } from './activity/activity.component';
import { SalesChartComponent } from './sales-chart/sales-chart.component';
import { ZoneDistributionChartComponent } from "./zone-distribution-chart/zone-distribution-chart.component";
import { StockinoutComponent } from "./stockinout/stockinout.component";



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TotalStockComponent,
    TodaySalesComponent,
    TotalZonesComponent,
    PendingTicketsComponent,
    ExpiringProductsComponent,
    ActivityComponent,
    SalesChartComponent,
    ZoneDistributionChartComponent,
    StockinoutComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
 
  constructor() {
      }
}
