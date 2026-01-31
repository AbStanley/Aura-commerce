import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container login-container">
      <div class="card login-card">
        <h2>Admin Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username</label>
            <input id="username" type="text" formControlName="username" placeholder="Enter username (admin)">
          </div>
          <div>
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="Enter password (admin)">
          </div>
          
          <p *ngIf="error" class="error">{{ error }}</p>

          <button type="submit" class="btn" [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .error {
      color: #ff5252;
      margin-bottom: 1rem;
    }
  `]
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    loading = false;
    error = '';

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.error = '';
        const { username, password } = this.loginForm.value;

        this.authService.login({ username: username!, password: password! })
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin']);
                },
                error: () => {
                    this.error = 'Invalid credentials';
                    this.loading = false;
                }
            });
    }
}
