import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DailyRevenue } from './dailyRevenue.model';

import { FormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexYAxis,
} from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { SalesChartService } from './sales-chart.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  colors: string[];
};

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss',
})
export class SalesChartComponent implements OnInit, OnDestroy {
  subsctiption!: Subscription;
  isLoaded: boolean = false;
  public chartOptions: ChartOptions;
  daysInput: number = 30;
  constructor(private salesChartService: SalesChartService) {
    this.chartOptions = {
      series: [{ name: 'Revenue', data: [] }],
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: true },
      },
      stroke: { curve: 'straight', width: 3 },
      dataLabels: { enabled: false },
      colors: ['#198754'],
      xaxis: { categories: [] },
      yaxis: {
        labels: {
          formatter: (val: number) => '₹' + val.toLocaleString('en-IN'),
        },
      },
    };
  }

  ngOnInit(): void {
    this.subsctiption = this.salesChartService
      .getDailyRevenue(this.daysInput)
      .subscribe({
        next: (data: DailyRevenue) => {
          this.updateChart(data);
          this.isLoaded = true;
        },
        error: (err) => {
          this.isLoaded = false;
        },
      });
  }
  onDaysChange() {
    this.subsctiption?.unsubscribe();
    this.subsctiption = this.salesChartService
      .getDailyRevenue(this.daysInput)
      .subscribe({
        next: (data: DailyRevenue) => {
          this.updateChart(data);
          this.isLoaded = true;
        },
        error: (err) => {
          this.isLoaded = false;
        },
      });
  }
  private updateChart(data: DailyRevenue) {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: 'Total Revenue',
          data: data.revenue, 
        },
      ],
      xaxis: {
        categories: data.dates.map(
          (
            d, 
          ) =>
            new Date(d).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            }),
        ),
      },
    };
  }
  ngOnDestroy(): void {
    this.subsctiption.unsubscribe();
  }
}
