import { Component, inject, OnInit } from '@angular/core';
import {
  ApexChart, ApexDataLabels, ApexLegend, ApexPlotOptions,
  ApexAxisChartSeries, NgApexchartsModule
} from 'ng-apexcharts';
import { CategoryAnalytic } from '../../sales.model';
import { PerformanceService } from '../../performance.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-treemap',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './treemap.component.html',
  styleUrl: './treemap.component.scss'
})
export class TreemapComponent implements OnInit {
  private performanceService = inject(PerformanceService);

  chartOptions?: ChartOptions;
  isLoading = true;

  categories: { _id: string; name: string }[] = [];
  selectedCategory?: { _id: string; name: string };
  selectedDays = 14;

  ngOnInit(): void {
    this.performanceService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.selectedCategory =
          categories.find(c => c.name === 'Dairy') ?? categories[0];
        if (this.selectedCategory) {
          this.loadTreemap(this.selectedCategory._id, this.selectedDays);
        }
      },
      error: (err) => {
        console.error('Failed to load best performing products', err);
        this.chartOptions = undefined as any;
        this.isLoading = false;
      }
    });
  }

  changeRange(days: number): void {
    if (this.selectedDays === days || !this.selectedCategory) return;
    this.selectedDays = days;
    this.loadTreemap(this.selectedCategory._id, days);
  }

  changeCategory(categoryId: string): void {
    if (this.selectedCategory?._id === categoryId) return;
    const cat = this.categories.find(c => c._id === categoryId);
    if (!cat) return;
    this.selectedCategory = cat;
    this.loadTreemap(cat._id, this.selectedDays);
  }

  loadTreemap(categoryId: string, days: number): void {
    this.isLoading = true;
    this.performanceService.getCategoryAnalytics(categoryId, days, 'BEST').subscribe({
      next: (data: CategoryAnalytic[]) => {
        this.chartOptions = {
          series: [{
            data: data.map(item => ({ x: item.productName, y: item.value }))
          }],
          chart: {
            type: 'treemap',
            height: 350,
            toolbar: { show: false },
            zoom: { enabled: false },
            selection: { enabled: false }
          },
          legend: { show: false },
          dataLabels: {
            enabled: true,
            style: { fontSize: '16px', fontWeight: 600 }
          },
          plotOptions: {
            treemap: {
              enableShades: true,
              shadeIntensity: 0.5,
              distributed: false
            }
          }
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Treemap load failed', err);
        this.chartOptions = undefined;
        this.isLoading = false;
      }
    });
  }
}