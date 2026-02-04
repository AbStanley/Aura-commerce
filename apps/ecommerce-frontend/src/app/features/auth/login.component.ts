import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from './auth.store';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    MessageModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center py-8">
      <div class="surface-card border-round-xl shadow-4 p-5 w-full animate-slide-up" style="max-width: 420px;">
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="flex justify-content-center mb-3">
            <div class="flex align-items-center justify-content-center border-round-xl" 
                 style="width: 64px; height: 64px; background: linear-gradient(135deg, var(--p-primary-color), var(--p-primary-400));">
              <i class="pi pi-user text-white text-4xl"></i>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-900 m-0 mb-2">Welcome Back</h2>
          <p class="text-500 m-0">Sign in to continue shopping</p>
        </div>

        <!-- Social Login Buttons -->
        <div class="flex gap-2 mb-4">
          <button type="button" 
                  class="p-button p-button-outlined p-button-secondary flex-1 justify-content-center social-btn google"
                  (click)="onGoogleLogin()">
            <i class="pi pi-google mr-2"></i>
            <span>Google</span>
          </button>
          <button type="button" 
                  class="p-button p-button-outlined p-button-secondary flex-1 justify-content-center social-btn github"
                  (click)="onGithubLogin()">
            <i class="pi pi-github mr-2"></i>
            <span>GitHub</span>
          </button>
        </div>

        <p-divider align="center">
          <span class="text-500 text-sm font-medium px-2">or continue with email</span>
        </p-divider>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4 mt-4">
          <!-- Email -->
          <div class="flex flex-column gap-2">
            <label for="email" class="font-medium text-900">Email</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope"></i>
              <input id="email" type="email" pInputText formControlName="email" 
                     placeholder="you@example.com" class="w-full" />
            </span>
          </div>

          <!-- Password -->
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between align-items-center">
              <label for="password" class="font-medium text-900">Password</label>
              <a href="#" class="text-primary text-sm no-underline hover:underline">Forgot password?</a>
            </div>
            <p-password id="password" formControlName="password" 
                        placeholder="Enter password"
                        [feedback]="false" 
                        [toggleMask]="true"
                        styleClass="w-full"
                        inputStyleClass="w-full"></p-password>
          </div>

          <!-- Error -->
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full"></p-message>
          }

          <!-- Submit -->
          <p-button type="submit" label="Sign In" 
                    icon="pi pi-sign-in"
                    [loading]="isLoading()" 
                    [disabled]="loginForm.invalid || isLoading()"
                    styleClass="w-full"></p-button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-5">
          <span class="text-500">Don't have an account? </span>
          <a routerLink="/register" class="text-primary font-medium no-underline hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-underline { text-decoration: none; }
    .hover\\:underline:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.getRawValue();
    const success = await this.authStore.login(email!, password!);

    if (success) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Invalid email or password');
    }

    this.isLoading.set(false);
  }

  onGoogleLogin() {
    // Mock Social Login: Redirect to callback with fake token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtdXNlciIsImVtYWlsIjoiZGVtb0Bnb29nbGUuY29tIiwibmFtZSI6Ikdvb2dsZSBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    window.location.href = `/auth/callback?token=${mockToken}&provider=Google`;
  }

  onGithubLogin() {
    // Mock Social Login: Redirect to callback with fake token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaXRodWItdXNlciIsImVtYWlsIjoiZGVtb0BnaXRodWIuY29tIiwibmFtZSI6IkdpdEh1YiBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    window.location.href = `/auth/callback?token=${mockToken}&provider=GitHub`;
  }
}
