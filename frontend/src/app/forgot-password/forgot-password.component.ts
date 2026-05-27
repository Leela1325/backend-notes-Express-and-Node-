import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ForgotPasswordService } from './forgot-password.service';
 
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {
  currentStep = 1;
 
  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;
 
  // Step 1
  emailVerified = false;
  isCheckingEmail = false;
  emailError = '';
  isSendingOtp = false;
 
  // Step 2
  otpSent = false;
  resendCooldown = 0;        // 30s timer for enabling Resend button
  canResendOtp = false;      // becomes true when resendCooldown hits 0
  otpExpired = false;        // becomes true after 5 min OR if backend says expired
  isVerifyingOtp = false;
  isResending = false;       // loader specifically for Resend OTP button
 
  // Step 3
  isSubmitting = false;
 
  // Two separate timers
  private resendInterval: any;
  private expiryTimeout: any;
 
  // OTP lifetime constants (kept in one place so easy to change later)
  private readonly RESEND_COOLDOWN_SECONDS = 30;
  private readonly OTP_EXPIRY_MINUTES = 5;
 
  constructor(
    private fb: FormBuilder,
    private forgotPasswordService: ForgotPasswordService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
 
    this.otpForm = this.fb.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern('^[0-9]*$'),
        ],
      ],
    });
 
    this.passwordForm = this.fb.group(
      {
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$*&])[A-Za-z\d@$*&]{8,}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }
 
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
 
  // ─── Step 1 ──────────────────────────────────────────────
  verifyEmail(): void {
    if (this.emailForm.invalid) return;
 
    this.isCheckingEmail = true;
    this.emailError = '';
    const email = this.emailForm.get('email')?.value.toLowerCase();
 
    this.forgotPasswordService.checkEmailExists(email).subscribe({
      next: (res) => {
        this.isCheckingEmail = false;
        if (res.exists) {
          this.emailVerified = true;
        } else {
          this.emailVerified = false;
          this.emailError = 'No account found with this email address.';
        }
      },
      error: () => {
        this.isCheckingEmail = false;
        this.emailError = 'Something went wrong. Please try again.';
      },
    });
  }
 
// Helper — opens sticky dev snackbar
  private showDevOtp(otp: string): void {
    this.snackBar.open(`OTP (dev mode): ${otp}`, 'Close', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      // no duration -> sticky until user clicks Close
    });
  }
 
  sendOtp(): void {
    const email = this.emailForm.get('email')?.value.toLowerCase();
    this.isSendingOtp = true;
    this.forgotPasswordService.sendOtp(email).subscribe({
      next: (data) => {
        console.log('OTP sent response:', data);
        this.isSendingOtp = false;
        this.otpSent = true;
        this.currentStep = 2;
        this.startResendCooldown();
        this.startOtpExpiryTimer();
 
        if (data.devFallback && data.otp) {
          this.showDevOtp(data.otp);
        } else {
          this.snackBar.open('OTP sent to your email.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        this.isSendingOtp = false;
        const msg = err?.error?.msg || 'Failed to send OTP. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
 
  resendOtp(): void {
    if (!this.canResendOtp || this.isResending) return;
 
    this.otpForm.reset();
    this.isResending = true;
    const email = this.emailForm.get('email')?.value.toLowerCase();
 
    this.forgotPasswordService.sendOtp(email).subscribe({
      next: (data) => {
        this.isResending = false;
        this.startResendCooldown();
        this.startOtpExpiryTimer();
 
        if (data.devFallback && data.otp) {
          this.showDevOtp(data.otp);
        } else {
          this.snackBar.open('A new OTP has been sent to your email.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        this.isResending = false;
        const msg = err?.error?.msg || 'Failed to resend OTP. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
 
  verifyOtp(): void {
    if (this.otpForm.invalid) return;
 
    this.isVerifyingOtp = true;
    const enteredOtp = this.otpForm.get('otp')?.value;
 
    this.forgotPasswordService.verifyOtp(enteredOtp).subscribe({
      next: (res) => {
        this.isVerifyingOtp = false;
        if (res.validated) {
          this.snackBar.open('OTP verified successfully!', 'Close', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.currentStep = 3;
          // stop timers — no longer needed
          this.clearTimers();
        } else {
          this.snackBar.open('Invalid OTP. Try again.', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        const msg = err?.error?.msg || 'Invalid OTP. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        // if backend says expired, mark as expired AND allow immediate resend
        if (msg.toLowerCase().includes('expired')) {
          this.otpExpired = true;
          this.canResendOtp = true;
          this.resendCooldown = 0;
          this.clearTimers();
        }
      },
    });
  }
 
  // ─── Timer helpers ───────────────────────────────────────
  private startResendCooldown(): void {
    this.resendCooldown = this.RESEND_COOLDOWN_SECONDS;
    this.canResendOtp = false;
    if (this.resendInterval) clearInterval(this.resendInterval);
    this.resendInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendInterval);
        this.canResendOtp = true;
      }
    }, 1000);
  }
 
  private startOtpExpiryTimer(): void {
    this.otpExpired = false;
    if (this.expiryTimeout) clearTimeout(this.expiryTimeout);
    this.expiryTimeout = setTimeout(
      () => {
        this.otpExpired = true;
      },
      this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );
  }
 
  private clearTimers(): void {
    if (this.resendInterval) clearInterval(this.resendInterval);
    if (this.expiryTimeout) clearTimeout(this.expiryTimeout);
  }
 
  // ─── Step 3 ──────────────────────────────────────────────
  resetPassword(): void {
    if (this.passwordForm.invalid) return;
 
    this.isSubmitting = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;
 
    this.forgotPasswordService.changePassword(newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open(
          'Password reset successfully! Redirecting to login...',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          },
        );
        this.forgotPasswordService.reset();
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.msg || 'Failed to reset password. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      },
    });
  }
 
  // ─── Navigation ──────────────────────────────────────────
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep = 1
     
     
        this.emailForm.reset();
        this.emailVerified = false;
        this.otpSent = false;
        this.otpExpired = false;
        this.canResendOtp = false;
        this.resendCooldown = 0;
        this.clearTimers();
        this.forgotPasswordService.reset();
     
    }
  }
 
  ngOnDestroy(): void {
    this.clearTimers();
    this.forgotPasswordService.reset();
  }
}
 