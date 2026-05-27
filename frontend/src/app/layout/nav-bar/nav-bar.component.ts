import {
  Component,
  EventEmitter,
  Inject,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { RouterLinkActive, RouterLink, Router } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLinkActive, RouterLink, NgIf],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  email = '';
  name = '';
  ngOnInit(): void {
    this.loginService.userData$.subscribe((data) => {
      this.email = data.email;
      this.name = data.name;
    });
  }
  router = inject(Router);
  items = [
    {
      feild: 'Dashboard',
      icon: 'bi bi-columns-gap',
      link: 'dashboard',
    },
    {
      feild: 'Stock Management',
      icon: 'bi bi-layers',
      link: 'stock-management',
    },
    {
      feild: 'Suppliers Management',
      icon: 'bi bi-people',
      link: 'supplier-management',
    },

    {
      feild: 'Tickets',
      icon: 'bi bi-ticket',
      link: 'tickets',
    },

    {
      feild: 'Sales',
      icon: 'bi bi-cart',
      link: 'sales',
    },
    {
      feild: 'Performance Analytics',
      icon: 'bi bi-graph-up',
      link: 'performance',
    },
    {
      feild : "Staff Registration",
      icon : "bi bi-person",
      link : "staff-registration"
    }
  ];
  loginService = inject(LoginService);
 
 onClick() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out of your account.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Logged out!',
        text: 'You have been logged out successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.loginService.logOut();
        this.router.navigate(['/login'], { replaceUrl: true });
      });
    }
  });
}

  
  isSidebarOpen = false;

toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

closeSidebarOnMobile() {
  if (window.innerWidth < 768) {
    this.isSidebarOpen = false;
  }
}
}
