import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ApexGrid, ApexMarkers, ApexYAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { PerformanceService } from '../../performance.service';


@Component({
  selector: 'app-category-sales',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './category-sales.component.html'
})
export class CategorySalesComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  selectedDays=14;
  isLoading=true;
  @ViewChild('categorychart') chartRef!: ChartComponent;
  private hasHiddenSeries = false;
  
  changeRange(days: number): void {
    if(this.selectedDays===days) return;
    this.selectedDays = days;
    this.loadChartData(days);
  }
  series: ApexAxisChartSeries = [];
  
  chart: ApexChart = {
    type: 'line',
    height: 350,
    toolbar: { show: false },
    // zoom: { enabled: false },
    // selection: { enabled: false },
    events: {
      mounted: () => {
      this.onChartRendered();
    }
    }
  };
  
  xaxis: ApexXAxis = {
    categories: [],
    title: { text: 'Day' },
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: {
        colors: '#9ca3af',
        fontSize: '11px',
        fontWeight: 500
      }
    }
  };
  
  yaxis: ApexYAxis = {
    labels: {
      style: {
        colors: '#9ca3af',
        fontSize: '11px',
        fontWeight: 500
      },
      formatter: (val: number) => `${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`
    }
  };
  
  markers: ApexMarkers = {
    size: 0,
    hover: { size: 5, sizeOffset: 3 }
  };
  
  stroke: ApexStroke = {
    curve: 'smooth',
    width: 3
  };
  
  grid: ApexGrid = {
    borderColor: '#f3f4f6',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 8, bottom: 0, left: 8 }
  };
  
  dataLabels: ApexDataLabels = { enabled: false };
  
  legend: ApexLegend = { position: 'bottom' };
  
  tooltip: ApexTooltip = { shared: true, intersect: false };
  
  ngOnInit(): void {
    this.loadChartData(this.selectedDays);
  }
  onChartRendered(): void {
    if (this.hasHiddenSeries) return;
    this.series.slice(3).forEach(s => {
      this.chartRef.hideSeries(s.name as string);
    });
    this.hasHiddenSeries = true;
  }
  
  loadChartData(days: number): void {
    this.isLoading = true;            
    this.hasHiddenSeries = false;

    this.performanceService.getWeeklyCategorySales(days).subscribe({
      next: result => {
        if (!result?.series?.length) {
          this.series = [];
          this.isLoading = false;   
          return;
        }
        this.series = result.series;
        this.xaxis = {
          ...this.xaxis,
          categories: result.dates  
        };
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load category chart data', err);
        this.series = [];
        this.isLoading = false;
      }
    });
  }
}