import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CreateStaff } from './createStaff.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ValidateEmail } from './validateMail.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  signupForm: FormGroup;
  router = inject(Router);
  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private validateEmail: ValidateEmail,
  ) {
    this.signupForm = this.fb.group(
      {
        name: [
          '',
          {
            validators: [
              Validators.required,
              Validators.pattern(/^[A-Za-z]+( [A-Za-z]+)*$/),
              Validators.maxLength(50),
            ],
            updateOn: 'blur',
          },
        ],
        email: [
          '',
          {
            validators: [
              Validators.required,
              Validators.email,
              Validators.pattern(
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              ),
            ],
            asyncValidators: [this.emailValidator],
            updateOn: 'blur',
          },
        ],
        password: [
          '',
          {
            validators: [Validators.required, this.passwordValidator],
          },
        ],
        confirmPassword: ['', { validators: Validators.required }],
        token: [
          '',
          {
            validators: [Validators.required],
            updateOn: 'blur',
          },
        ],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordValidator(password: FormControl) {
    let pattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$*&])[A-Za-z\d@$*&]{8,}$/;
    return pattern.test(password.value) ? null : { invalidPassword: true };
  }
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  emailValidator = (control: FormControl) => {
    return this.validateEmail.validateEmail(control.value.toLowerCase());
  };

  createStaffService = inject(CreateStaff);
  onSubmit() {
    const user = {
      name: this.signupForm.get('name')?.value,
      email: this.signupForm.get('email')?.value.toLowerCase(),
      password: this.signupForm.get('password')?.value,
      token: this.signupForm.get('token')?.value.trim(),
    };
    this.createStaffService.createStaff(user).subscribe({
      next: () => {
        this.snack.open('Signup successful! Redirecting to login...', 'ok', {
          duration: 2000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 2000);
      },
      error: (err) => {
        const msg = err?.error?.msg || 'Signup failed. Please try again.';
        this.snack.open(msg, 'ok', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
    });
  }
}