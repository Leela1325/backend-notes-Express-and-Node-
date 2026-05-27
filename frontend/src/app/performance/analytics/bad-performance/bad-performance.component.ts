import { Component, inject, OnInit } from '@angular/core';
import { CategoryAnalytic } from '../../sales.model';
import { PerformanceService } from '../../performance.service';

@Component({
  selector: 'app-bad-performance',
  standalone: true,
  imports: [],
  templateUrl: './bad-performance.component.html',
  styleUrl: './bad-performance.component.scss'
})
export class BadPerformanceComponent implements OnInit {
  private performanceService = inject(PerformanceService);

  categories: { _id: string; name: string }[] = [];
  selectedCategory?: { _id: string; name: string };
  selectedDays = 30;
  isLoading = true;
  badPerformingData: CategoryAnalytic[] = [];

  ngOnInit(): void {
    this.performanceService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.selectedCategory =
          categories.find(c => c.name === 'Dairy') ?? categories[0];
        if (this.selectedCategory) {
          this.loadTable();
        } else {
          this.isLoading = false;  
        }
      },
      error: (err) => {                         
        console.error('Failed to load categories', err);
        this.isLoading = false;
      },
    });
  }

  changeRange(days: number): void {
    if (this.selectedDays === days) return;
    this.selectedDays = days;
    this.loadTable();
  }

  changeCategory(categoryId: string): void {
    if (this.selectedCategory?._id === categoryId) return;
    const cat = this.categories.find(c => c._id === categoryId);
    if (!cat) return;
    this.selectedCategory = cat;
    this.loadTable();
  }

  loadTable(): void {
    if (!this.selectedCategory) return;
    this.isLoading = true;
    this.performanceService
      .getCategoryAnalytics(this.selectedCategory._id, this.selectedDays, 'WORST')
      .subscribe({
        next: (data: CategoryAnalytic[]) => {
          this.badPerformingData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load bad performance data', err);
          this.badPerformingData = [];
          this.isLoading = false;
        }
      });
  }
}