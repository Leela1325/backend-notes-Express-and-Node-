import { Component, inject, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries, ApexChart, ApexDataLabels,
  ApexGrid, ApexPlotOptions, ApexTooltip, ApexXAxis,
  ApexYAxis, NgApexchartsModule
} from 'ng-apexcharts';
import { PerformanceService } from '../../performance.service';
import { DailySale } from '../../sales.model';

type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
  tooltip: ApexTooltip;
  grid: ApexGrid;
};

@Component({
  selector: 'app-daily-sales-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './daily-sales-chart.component.html',
  styleUrl: './daily-sales-chart.component.scss'
})
export class DailySalesChartComponent implements OnInit {
  private performanceService = inject(PerformanceService);

  chartOptions!: ChartOptions;
  isLoading = true;

  categories: { _id: string; name: string }[] = [];
  selectedCategory?: { _id: string; name: string };
  selectedDays = 7;

  ngOnInit(): void {
    this.performanceService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.selectedCategory =
          categories.find(c => c.name === 'Dairy') ?? categories[0];
        this.loadChart();
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.isLoading = false;
      }
    });
  }

  changeRange(days: number): void {
    if (this.selectedDays === days) return;
    this.selectedDays = days;
    this.loadChart();
  }

  changeCategory(categoryId: string): void {
    if (this.selectedCategory?._id === categoryId) return;
    const cat = this.categories.find(c => c._id === categoryId);
    if (!cat) return;
    this.selectedCategory = cat;
    this.loadChart();
  }

  loadChart(): void {
    if (!this.selectedCategory) return;
    this.isLoading = true;   
    this.performanceService
      .getDailySalesByCategory(this.selectedCategory._id, this.selectedDays) 
      .subscribe({    
        next: (salesData: DailySale) => {
          this.isLoading = false;

          this.chartOptions = {
            series: [{ name: 'Revenue', data: salesData.revenue }],
            chart: {
              type: 'bar',
              height: 320,
              toolbar: { show: false },
              fontFamily: 'inherit',
              animations: {
                enabled: true,
                speed: 400,
                animateGradually: { enabled: false }
              }
            },
            plotOptions: {
              bar: {
                borderRadius: 5,
                borderRadiusApplication: 'end',
                columnWidth: '55%',
                dataLabels: { position: 'top' }
              }
            },
            colors: ['#378ADD'],
            dataLabels: {
              enabled: this.selectedDays <= 7,
              offsetY: -22,
              style: {
                fontSize: '11px',
                fontWeight: '500',
                colors: ['#185FA5']
              },
              formatter: (val: number) => '₹' + val.toLocaleString('en-IN')
            },
            xaxis: {
              categories: salesData.dates,  
              axisBorder: { show: false },
              axisTicks: { show: false },
              labels: { style: { fontSize: '11px', colors: '#6c757d' } }
            },
            yaxis: {
              labels: {
                formatter: (val: number) => '₹' + val.toLocaleString('en-IN'),
                style: { fontSize: '11px', colors: ['#6c757d'] }
              }
            },
            grid: {
              borderColor: '#f1f3f5',
              strokeDashArray: 4,
              yaxis: { lines: { show: true } },
              xaxis: { lines: { show: false } },
              padding: { top: 10, right: 0, bottom: 0, left: 10 }
            },
            tooltip: {
              y: { formatter: (val: number) => '₹' + val.toLocaleString('en-IN') }
            }
          };
        },
        error: (err) => {
          console.error('Failed to load Daily Sales chart data', err);
          this.isLoading = false;
        }
      });
  }
}