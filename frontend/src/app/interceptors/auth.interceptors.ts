import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const isAuthEndpoint =
    req.url.includes('/login') || req.url.includes('/Signup');

  if (token && !isAuthEndpoint) {
   
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }


  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.navigate(['/login'], { replaceUrl: true });
      }
    
      return throwError(() => err);
    }),
  );
};