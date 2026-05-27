import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ValidateEmail {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4040/user';  

  validateEmail(email: string): Observable<null | { emailInvalid: true }> {
    return this.http
      .get<{ exists: boolean }>(`${this.baseUrl}/validate-email?email=${email}`)
      .pipe(
        map((res) => (res.exists ? { emailInvalid: true } : null)),
      );
  }
}