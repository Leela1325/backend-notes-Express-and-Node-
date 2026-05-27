import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateFn } from '@angular/router';
import { LoginService } from '../../login/login.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(
//     private loginService: LoginService,
//     private router: Router,
//   ) {}

//   canActivate(): boolean {

//     if (this.loginService.getAccess) return true;

//     this.router.navigate(['/login']);
//     return false;
//   }
// }

export const canActivate: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.getAccess) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
