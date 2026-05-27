import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserRegistrationService } from './user-registration.service';

interface StatusMessage {
  type: 'success' | 'error' | null;
  message: string;
}

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class RegisterUserComponent {
  private readonly fb = inject(FormBuilder);
  private readonly registrationService = inject(UserRegistrationService);
  private readonly snackBar = inject(MatSnackBar);

  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isSending = signal(false);
  isResending = signal(false);
  status = signal<StatusMessage>({ type: null, message: '' });

  get email() {
    return this.registerForm.controls.email;
  }

  private showDevToken(token: string): void {
    this.snackBar.open(`Token (dev mode): ${token}`, 'Close', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      // no duration -> sticky
    });
  }

  sendToken() {
    if (this.registerForm.invalid || this.isSending() || this.isResending()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.status.set({ type: null, message: '' });

    this.registrationService.createUser(this.email.value).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.status.set({ type: 'success', message: res.message });
        if (res.devFallback && res.token) {
          this.showDevToken(res.token);
        }
      },
      error: (err) => {
        this.isSending.set(false);
        this.status.set({
          type: 'error',
          message:
            err?.error?.message ?? 'Something went wrong. Please try again.',
        });
      },
    });
  }

  resendToken() {
    if (this.registerForm.invalid || this.isSending() || this.isResending()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isResending.set(true);
    this.status.set({ type: null, message: '' });

    this.registrationService.resendToken(this.email.value).subscribe({
      next: (res) => {
        this.isResending.set(false);
        this.status.set({ type: 'success', message: res.message });
        if (res.devFallback && res.token) {
          this.showDevToken(res.token);
        }
      },
      error: (err) => {
        this.isResending.set(false);
        this.status.set({
          type: 'error',
          message:
            err?.error?.message ?? 'Something went wrong. Please try again.',
        });
      },
    });
  }
}