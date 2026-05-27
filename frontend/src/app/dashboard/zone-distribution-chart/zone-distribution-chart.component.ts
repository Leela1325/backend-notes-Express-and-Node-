import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Subscription } from 'rxjs';
import { ZoneDistributionChartService } from './zone-distribution-chart.service';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexLegend,
  ApexDataLabels,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  colors: string[];
};

@Component({
  selector: 'app-zone-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './zone-distribution-chart.component.html',
  styleUrl: './zone-distribution-chart.component.scss',
})
export class ZoneDistributionChartComponent implements OnInit, OnDestroy {
  private zoneDistributionService = inject(ZoneDistributionChartService);

  private zonesSubscription?: Subscription;
  private distributionSubscription?: Subscription;

  isLoaded : boolean = false;
  zoneIdInput = '';
  zones: { id: string; name: string }[] = [];

  chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'pie',
      height: 350,
    },
    labels: [],
    colors: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

  ngOnInit(): void {
    this.zonesSubscription = this.zoneDistributionService.getZones().subscribe({
      next: (zones) => {
        this.zones = zones;
        if (zones.length > 0) {
          this.zoneIdInput = zones[0].id;
          this.loadDistribution(this.zoneIdInput);
        }
      },
      error: (err) => {
        this.isLoaded = false;
        
      },
    });
  }

  onZoneChange(): void {
    this.loadDistribution(this.zoneIdInput);
  }

  private loadDistribution(zoneid: string): void {
    this.distributionSubscription?.unsubscribe();

    this.distributionSubscription = this.zoneDistributionService
      .getZoneDistribution(zoneid)
      .subscribe({
        next: (data) => {
          this.chartOptions = {
            ...this.chartOptions,
            series: data.distribution,
            labels: data.categoryName,
          };
          this.isLoaded = true;
        },
        error: (err) => {
          this.isLoaded = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.zonesSubscription?.unsubscribe();
    this.distributionSubscription?.unsubscribe();
  }
}
