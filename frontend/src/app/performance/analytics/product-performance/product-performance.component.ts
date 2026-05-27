import { Component, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions,
  ApexFill,
  ApexGrid,
  ApexTooltip,
  ApexLegend,
  ApexTheme,
} from 'ng-apexcharts';
import { PerformanceService } from '../../performance.service';

// ---------- Chart-option interfaces ----------

export interface MixedChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
  dataLabels: ApexDataLabels;
}

export interface HeatmapChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
  colors: string[];
  theme: ApexTheme;
}

// ---------- Component ----------

@Component({
  selector: 'app-product-performance',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './product-performance.component.html',
  styleUrl: './product-performance.component.scss',
})
export class ProductPerformanceComponent implements OnChanges {
  @ViewChild('mixedChartRef') mixedChartRef!: ChartComponent;
  @ViewChild('heatmapChartRef') heatmapChartRef!: ChartComponent;

  @Input() productId!: string;

  private performanceService = inject(PerformanceService);

  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Metric cards
  totalRevenue = 0;
  totalUnits = 0;
  avgPrice = 0;
  peakMonth = '';

  // Chart options (null until data arrives → the @if in template guards rendering)
  mixedChartOptions: MixedChartOptions | null = null;
  heatmapChartOptions: HeatmapChartOptions | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadPerformanceData();
    }
  }

  private loadPerformanceData(): void {
    this.performanceService.getProductPerformance(this.productId).subscribe(data => {
      this.totalRevenue = data.revenue.reduce((a, b) => a + b, 0);
      this.totalUnits = data.units.reduce((a, b) => a + b, 0);
      this.avgPrice = this.totalUnits > 0
        ? Math.round((this.totalRevenue / this.totalUnits) * 10) / 10
        : 0;
      const peakIdx = data.revenue.indexOf(Math.max(...data.revenue));
      this.peakMonth = this.months[peakIdx];

      this.buildMixedChart(data.revenue, data.units);
      this.buildHeatmapChart(data.heatmap);
    });
  }

  // ---------- Mixed chart (Bar + Line) ----------

  private buildMixedChart(revenue: number[], units: number[]): void {
    this.mixedChartOptions = {
      series: [
        { name: 'Revenue', type: 'column', data: revenue },
        { name: 'Units Sold', type: 'line', data: units },
      ],
      chart: {
        type: 'line',
        height: 340,
        fontFamily: 'inherit',
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#534AB7', '#1D9E75'],
      stroke: { width: [0, 3], curve: 'smooth' },
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '55%' },
      },
      fill: { opacity: [0.85, 1] },
      xaxis: {
        categories: this.months,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          title: { text: 'Revenue (₹)' },
          labels: {
            formatter: (val: number) => '₹' + Math.round(val / 1000) + 'k',
          },
        },
        {
          opposite: true,
          title: { text: 'Units' },
          labels: {
            formatter: (val: number) => String(Math.round(val)),
          },
        },
      ],
      grid: { borderColor: '#e0e0e0', strokeDashArray: 4 },
      tooltip: {
        y: {
          formatter: (val: number, opts: any) =>
            opts.seriesIndex === 0 ? '₹' + val.toLocaleString('en-IN') : val + ' units',
        },
      },
      legend: { show: true, position: 'top', horizontalAlign: 'left' },
      dataLabels: { enabled: false },
    };
  }

  // ---------- Heatmap chart ----------

  private buildHeatmapChart(heatmap: number[][]): void {
    // ApexCharts heatmap: series = rows (days, top→bottom), data = columns (months)
    const series = [...this.days]
      .reverse()
      .map((day, reversedIdx) => {
        const dayIdx = this.days.length - 1 - reversedIdx;
        return {
          name: day,
          data: this.months.map((m, mi) => ({ x: m, y: heatmap[mi]?.[dayIdx] ?? 0 })),
        };
      });

    // Determine heatmap range dynamically from actual data
    const flat = heatmap.flat();
    const maxVal = Math.max(...flat, 1);
    const q1 = Math.round(maxVal * 0.25);
    const q2 = Math.round(maxVal * 0.50);
    const q3 = Math.round(maxVal * 0.75);

    this.heatmapChartOptions = {
      series,
      chart: {
        type: 'heatmap',
        height: 280,
        fontFamily: 'inherit',
        toolbar: { show: false },
        background: 'transparent',
      },
      colors: ['#534AB7'],
      dataLabels: { enabled: true, style: { fontSize: '11px', fontWeight: '400' } },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {},
      plotOptions: {
        heatmap: {
          radius: 4,
          shadeIntensity: 0.6,
          colorScale: {
            ranges: [
              { from: 0,      to: q1,     color: '#CECBF6', name: 'Low' },
              { from: q1 + 1, to: q2,     color: '#AFA9EC', name: 'Medium' },
              { from: q2 + 1, to: q3,     color: '#7F77DD', name: 'High' },
              { from: q3 + 1, to: maxVal, color: '#534AB7', name: 'Peak' },
            ],
          },
        },
      },
      grid: { show: false },
      tooltip: {
        y: { formatter: (val: number) => val + ' sales' },
      },
      legend: { show: true, position: 'bottom' },
      theme: { mode: 'light' },
    };
  }
}