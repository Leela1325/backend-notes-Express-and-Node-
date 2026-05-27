// role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../login/login.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const userRole = loginService.getRole();
  const expectedRoles = route.data['roles'] as Array<string>;

  if (loginService.getAccess && expectedRoles.includes(userRole!)) {
    return true;
  }
 
 
  if (userRole === 'staff') {
    router.navigate(['/sales']);
  } else {
    loginService.logOut();
    router.navigate(['/login']);
  }
  return false;
};
