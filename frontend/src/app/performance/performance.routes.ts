import { Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';

export const performanceRoutes: Routes = [
  {
    path: '',
    component: AnalyticsComponent,
    pathMatch: 'full',
  },
];
