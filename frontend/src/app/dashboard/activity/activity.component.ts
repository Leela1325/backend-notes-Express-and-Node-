import { Component, OnDestroy, OnInit } from '@angular/core';
import { Activity } from './activity.model';
import { ActivityService } from './activity.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe],
})
export class ActivityComponent implements OnInit , OnDestroy {
  activityData : { data : Activity[] } = { data: [] };
  selectedDays = 1;
  subscription !: Subscription ;
  isLoaded : boolean = false ;
  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.subscription = this.activityService.getRecentActivity(this.selectedDays).subscribe((data) => {
      this.activityData = data;
      this.isLoaded = true;
    });
  }

  onFilterChange() {
    this.subscription = this.activityService.getRecentActivity(this.selectedDays).subscribe( {next : (data) => {
      this.activityData = data;
      this.isLoaded = true;
    } , 
    error : (err) => {
      this.isLoaded = false;
    }});
  }

  ngOnDestroy(): void {
     this.subscription.unsubscribe() ;
  }
}
