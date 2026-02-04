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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center min-h-30rem py-6">
      <p-card class="w-full max-w-25rem animate-fade-in">
        <ng-template pTemplate="header">
          <div class="text-center p-4 pb-0">
            <i class="pi pi-user text-4xl text-primary mb-3"></i>
            <h2 class="text-2xl font-bold m-0">Welcome Back</h2>
            <p class="text-500 mt-2 mb-0">Sign in to continue shopping</p>
          </div>
        </ng-template>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <!-- Email -->
          <div class="flex flex-column gap-2">
            <label for="email" class="font-medium">Email</label>
            <p-iconfield>
              <p-inputicon styleClass="pi pi-envelope"></p-inputicon>
              <input id="email" type="email" pInputText formControlName="email" 
                     placeholder="you@example.com" class="w-full" />
            </p-iconfield>
          </div>

          <!-- Password -->
          <div class="flex flex-column gap-2">
            <label for="password" class="font-medium">Password</label>
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
                    [loading]="isLoading()" 
                    [disabled]="loginForm.invalid || isLoading()"
                    styleClass="w-full"></p-button>

          <p-divider align="center">
            <span class="text-500 text-sm">or continue with</span>
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

        <ng-template pTemplate="footer">
          <div class="text-center">
            <span class="text-500">Don't have an account? </span>
            <a routerLink="/register" class="text-primary font-medium no-underline hover:underline">
              Sign up
            </a>
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .min-h-30rem { min-height: 30rem; }
    .max-w-25rem { max-width: 25rem; }
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
