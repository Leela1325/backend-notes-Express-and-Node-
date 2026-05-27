import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { StockinoutService } from './stockinout.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  ApexXAxis,
  ApexPlotOptions,
  ApexTooltip,
  ApexLegend,
  ApexResponsive,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  tooltip: ApexTooltip;
  legend: ApexLegend;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-stockinout',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './stockinout.component.html',
  styleUrl: './stockinout.component.scss',
})
export class StockinoutComponent implements OnInit, OnDestroy {
  private stockInOutService = inject(StockinoutService);
  private subscription!: Subscription;

  isLoaded = false;

  chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
    },
    colors: ['#198745', '#dc3545'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',   // thickness of each bar (vertical)
        borderRadius: 5,
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all'
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1, colors: ['#fff'] },
    grid: {
      xaxis: { lines: { show: false } },
    },
    yaxis: { min: 0, max: 0 },
    xaxis: {
      categories: [],
      title: { text: 'Quantity' },
      labels: {
        formatter: (val: string) =>
          Math.abs(Math.round(parseInt(val))).toString(),
      },
    },
    tooltip: {
      shared: false,
      y: { formatter: (val: number) => Math.abs(val) + ' units' },
    },
    legend: { position: 'bottom' },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 350 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

  ngOnInit(): void {
    this.subscription = this.stockInOutService.getStockInOut().subscribe({
      next: (data) => {
       
        const max = Math.max(
          ...data.stockIn.map(Math.abs),
          ...data.stockOut,
        );

        
        const axisLimit = Math.ceil(max / 0.7);

        this.chartOptions = {
          ...this.chartOptions,
          series: [
            { name: 'Stock In', data: data.stockIn },
            { name: 'Stock Out', data: data.stockOut },
          ],
          xaxis: {
            ...this.chartOptions.xaxis,
            categories: data.dates,
          },
          yaxis: { min: -axisLimit, max: axisLimit },
        };

        this.isLoaded = true;
      },
      error: (err) => {
       this.isLoaded = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}