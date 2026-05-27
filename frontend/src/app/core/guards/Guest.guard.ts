import { CanActivateFn, Router } from "@angular/router";
import { LoginService } from "../../login/login.service";
import { inject } from "@angular/core";

export const guestGuard : CanActivateFn = ()=> {
  const  loginService = inject(LoginService) ;
  const router = inject(Router) ;
  if(loginService.getAccess)
  {
    if(loginService.getRole() === 'admin')
    {
        router.navigate(['/dashboard']) ;
        
    }
    else
    {
      router.navigate(['/sales']) ;
    }
    return false ;
  }
  return true ;
}