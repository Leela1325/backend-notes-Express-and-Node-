import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm = new FormGroup({
    email: new FormControl<string | null>('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    ]),
    password: new FormControl<string | null>('', Validators.required),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.loginService
      .login({ email: email!, password: password! })
      .subscribe({
        next: (user) => {
          const role = user.role.toLowerCase();
         
          if (role === 'staff') {
            this.router.navigate(['/sales'], { replaceUrl: true });
          } else if (role === 'admin') {
            this.router.navigate(['/dashboard'], { replaceUrl: true });
          }
        },
        error: (err) => {
          this.loginForm.reset();
          const msg = err?.error?.msg || 'Login failed. Try again.';
          this.snackBar.open(msg, 'ok', {
            verticalPosition: 'top',
            horizontalPosition: 'center',
            duration: 3000,
          });
        },
      });
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}