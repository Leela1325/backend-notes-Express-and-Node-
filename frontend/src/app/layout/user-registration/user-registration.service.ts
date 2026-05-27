import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TokenResponse {
  message: string;
  devFallback?: boolean;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class UserRegistrationService {
  private readonly http = inject(HttpClient);
  private readonly API_BASE = 'http://localhost:4040/user';

  createUser(email: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.API_BASE}/generate-staff-token`,
      { email: email.trim() },
    );
  }

  resendToken(email: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.API_BASE}/resend-staff-token`,
      { email: email.trim() },
    );
  }
}