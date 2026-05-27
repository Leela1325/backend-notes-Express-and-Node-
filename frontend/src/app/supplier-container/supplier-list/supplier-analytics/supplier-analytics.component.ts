import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-supplier-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './supplier-analytics.component.html'
})
export class SupplierAnalyticsComponent implements OnInit {

  suppliers: any[] = history.state.suppliers || [];

  isLoading = true;
  isBarLoading = true;

  selectedSupplierId = '';
  selectedSupplierInfo: any = null;

  chartOptions: any;

  barChartOptions: any = {
    series: [{ data: [] }],
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: [] }
  };

  allData: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.suppliers.length) {
      this.loadTreemap();
      this.loadBarData();
    } else {
      this.isLoading = false;
      this.isBarLoading = false;
    }
  }

  
  loadTreemap() {
    const ids = this.suppliers.map(s => s.id).join(',');

    this.http.get<any>(`http://localhost:4040/suppliers/by-supplier?supplierids=${ids}`)
      .subscribe({
        next: (res) => {
          
          this.chartOptions = {
            series: [{
              name:'purchased products',
              data: res.data.map((d: any) => ({
                x: this.getName(d._id),
                y: d.totalQuantity
              }))
            },
           
          ],
            chart: { type: 'treemap', height: 350 },
            colors:["#198784"]
          };
          this.isLoading = false;
        },
        error: (err) => {
         
          this.isLoading = false;
        }
      });
  }

 
  loadBarData() {
    const ids = this.suppliers.map(s => s.id).join(',');

    this.http.get<any>(`http://localhost:4040/suppliers/all-purchase-feedback?supplierids=${ids}`)
      .subscribe({
        next: (res) => {
      

          if (res.success && res.data) {
            res.data.forEach((s: any) => {
              this.allData[s.supplierid] = s;
            });

            this.selectedSupplierId = this.suppliers[0]?.id || '';
            setTimeout(()=>{
              this.onSupplierChange();
            },200);
            
          }

          this.isBarLoading = false;
        },
        error: (err) => {
     
          this.isBarLoading = false;
        }
      });
  }


  onSupplierChange() {
    const s = this.allData[this.selectedSupplierId];



    if (!s || !s.purchases || s.purchases.length === 0) {
      this.selectedSupplierInfo = null;
      this.barChartOptions = {
        series: [{ data: [] }],
        chart: { type: 'bar', height: 350 },
        xaxis: { categories: [] }
      };
      return;
    }

    this.selectedSupplierInfo = {
      name: s.name,
      rating: s.rating,
      performance: s.performance
    };

    this.barChartOptions = {
      series: [{
        name: 'Quantity Purchased',
        data: s.purchases.map((p: any) => p.quantity)
      }],
      chart: { 
        type: 'bar', 
        height: 350,
        toolbar: { show:true },
        animations: { enabled: true }
      },
      xaxis: {
        categories: s.purchases.map((p: any) =>
          new Date(p.timestamp).toLocaleDateString()
        ),
        title: { text: 'Purchase Date' }
      },
      yaxis: {
        title: { text: 'Quantity' }
      },
      colors: ['#0d6efd'],
      dataLabels: { enabled: false }
    };
  }

  getName(id: string) {
    return this.suppliers.find(s => s.id === id)?.name || id;
  }

  round(val: number) {
    return val?.toFixed(2);
  }
}