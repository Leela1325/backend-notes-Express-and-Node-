import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { canActivate } from './core/guards/auth.guards';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RoleGuard } from './core/guards/role.guards';
import { PerformanceComponent } from './performance/performance.component';
import { performanceRoutes } from './performance/performance.routes';
import { SalesComponent } from './sales/sales.component';
import { TicketComponent } from './ticket/ticket.component';
import { StockContainerComponent } from './stock-container/stock-container.component';
import { ZoneListComponent } from './stock-container/zone-list/zone-list.component';
import { CategoryListComponent } from './stock-container/category-list/category-list.component';
// import { ProductsListComponent } from './stock-container/products-list/products-list.component';
import { SupplierContainerComponent } from './supplier-container/supplier-container.component';
import { NewsupplierComponent } from './supplier-container/supplier-list/new-supplier/new-supplier.component';
import { SupplierfeedbackComponent } from './supplier-container/supplier-list/supplier-feedback/supplier-feedback.component';
import { SuppliersListComponent } from './supplier-container/supplier-list/supplier-list.component';
import { ServiceZoneListComponent } from './supplier-container/zone-list/zone-list.component';
import { ServiceCategoryListComponent } from './supplier-container/category-list/category-list.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { guestGuard } from './core/guards/Guest.guard';
import { ProductsListComponent } from './stock-container/products-list/products-list.component';
import { RegisterUserComponent } from './layout/user-registration/user-registration.component';
import { SupplierAnalyticsComponent }  from './supplier-container/supplier-list/supplier-analytics/supplier-analytics.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signUp', component: SignUpComponent, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [canActivate],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'stock-management',
        component: StockContainerComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            component: ZoneListComponent,
          },
          {
            path: ':zoneid',
            component: CategoryListComponent,
          },
          {
            path: ':zoneid/category/:categoryid',
            component: ProductsListComponent,
          },
        ],
      },
      {
        path: 'supplier-management',
        component: SupplierContainerComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            component: ServiceZoneListComponent,
          },
          {
            path: ':zoneid/category-list/:categoryid/suppliers-list',
            component: SuppliersListComponent,
            children: [],
          },

          {
            path: ':zoneid/category-list',
            component: ServiceCategoryListComponent,
          },
          {
            path: ':zoneid/category-list/:categoryid/suppliers-list/new-supplier',
            component: NewsupplierComponent,
          },
          {
            path:'supplier-analytics',
            component: SupplierAnalyticsComponent
          }
        ],
      },
      {
        path: 'tickets/:supplierid/submit-feedback',
        component: SupplierfeedbackComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'performance',
        component: PerformanceComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: performanceRoutes,
      },
      {
        path: 'sales',
        component: SalesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'staff'] },
      },
      {
        path: 'tickets',
        component: TicketComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'staff-registration',

        component: RegisterUserComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
      },
    ],
  },
  { path: 'login', redirectTo: 'login' },
  { path: '**', redirectTo: 'dashboard' },
];
