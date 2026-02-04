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
import { FloatLabelModule } from 'primeng/floatlabel';

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
    MessageModule,
    FloatLabelModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center py-8">
      <div class="surface-card border-round-xl shadow-4 p-5 w-full animate-fade-in" style="max-width: 400px;">
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="flex justify-content-center mb-3">
            <div class="flex align-items-center justify-content-center bg-primary-100 border-round-xl" 
                 style="width: 64px; height: 64px;">
              <i class="pi pi-user text-primary text-4xl"></i>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-900 m-0 mb-2">Welcome Back</h2>
          <p class="text-500 m-0">Sign in to continue shopping</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
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
            <label for="password" class="font-medium text-900">Password</label>
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

          <p-divider align="center">
            <span class="text-500 text-sm font-medium">or continue with</span>
          </p-divider>

          <!-- Social Login Placeholders -->
          <div class="flex gap-2">
            <p-button icon="pi pi-google" severity="secondary" [outlined]="true" 
                      styleClass="flex-1" [disabled]="true"></p-button>
            <p-button icon="pi pi-github" severity="secondary" [outlined]="true" 
                      styleClass="flex-1" [disabled]="true"></p-button>
            <p-button icon="pi pi-apple" severity="secondary" [outlined]="true" 
                      styleClass="flex-1" [disabled]="true"></p-button>
          </div>
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
}
