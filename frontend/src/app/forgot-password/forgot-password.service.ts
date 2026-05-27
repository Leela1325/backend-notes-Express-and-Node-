import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface SendOtpResponse {
  sent: string;
  devFallback?: boolean;
  otp?: string;
}

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:4040';

  private resetToken: string | null = null;
  private currentEmail: string | null = null;

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(
      `${this.baseUrl}/user/validate-email?email=${email}`,
    );
  }

  sendOtp(email: string): Observable<SendOtpResponse> {
    this.currentEmail = email;
    return this.http.post<SendOtpResponse>(
      `${this.baseUrl}/forgotPassword/sendOtp`,
      { email },
    );
  }

  verifyOtp(
    otp: string,
  ): Observable<{ validated: boolean; resetToken?: string }> {
    return this.http
      .post<{ validated: boolean; resetToken?: string }>(
        `${this.baseUrl}/forgotPassword/verifyOtp`,
        { email: this.currentEmail, otp },
      )
      .pipe(
        tap((res) => {
          if (res.validated && res.resetToken) {
            this.resetToken = res.resetToken;
          }
        }),
      );
  }

  changePassword(newPassword: string): Observable<{ msg: string }> {
    return this.http.patch<{ msg: string }>(
      `${this.baseUrl}/forgotPassword/changePassword`,
      { resetToken: this.resetToken, password: newPassword },
    );
  }

  reset(): void {
    this.resetToken = null;
    this.currentEmail = null;
  }
}