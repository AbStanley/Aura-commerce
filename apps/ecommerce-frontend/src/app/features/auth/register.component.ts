import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from './auth.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center px-4">
      <div class="w-full max-w-md space-y-8 animate-fade-in">
        <!-- Card -->
        <div class="card p-8">
          <!-- Header -->
          <div class="text-center space-y-2 mb-8">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-foreground">Create an account</h1>
            <p class="text-muted-foreground text-sm">
              Join us to start shopping
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <label for="firstName" class="text-sm font-medium text-foreground">First Name</label>
                <input 
                  id="firstName" 
                  formControlName="firstName" 
                  type="text" 
                  placeholder="John"
                  class="input"
                  [class.input-error]="registerForm.get('firstName')?.touched && registerForm.get('firstName')?.invalid"
                >
              </div>
              <div class="space-y-2">
                <label for="lastName" class="text-sm font-medium text-foreground">Last Name</label>
                <input 
                  id="lastName" 
                  formControlName="lastName" 
                  type="text" 
                  placeholder="Doe"
                  class="input"
                  [class.input-error]="registerForm.get('lastName')?.touched && registerForm.get('lastName')?.invalid"
                >
              </div>
            </div>

            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-foreground">Email</label>
              <div class="relative">
                <input 
                  id="email" 
                  formControlName="email"
                  type="email" 
                  placeholder="you@example.com"
                  class="input pl-10"
                  [class.input-error]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                >
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                </svg>
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium text-foreground">Password</label>
              <div class="relative">
                <input 
                  id="password" 
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'" 
                  placeholder="••••••••"
                  class="input pl-10 pr-10"
                  [class.input-error]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                >
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <button 
                  type="button" 
                  (click)="togglePassword()" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              
              <!-- Password Strength Indicator -->
              <div class="space-y-1">
                <div class="flex gap-1">
                  @for (i of [0, 1, 2, 3]; track i) {
                    <div 
                      class="h-1 flex-1 rounded-full transition-colors"
                      [class]="i < passwordStrength() ? strengthColor() : 'bg-muted'">
                    </div>
                  }
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ strengthLabel() }}
                </p>
              </div>
            </div>

            <!-- Terms Checkbox -->
            <div class="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms"
                formControlName="acceptTerms"
                class="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
              >
              <label for="terms" class="text-sm text-muted-foreground">
                I agree to the 
                <a href="#" class="text-primary hover:underline">Terms of Service</a> 
                and 
                <a href="#" class="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>

            <!-- Error Message -->
            @if (error()) {
              <div class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ error() }}
              </div>
            }

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="registerForm.invalid || isLoading()"
              class="btn btn-primary btn-md w-full">
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating account...
              } @else {
                Create account
              }
            </button>
          </form>
        </div>

        <!-- Footer Links -->
        <div class="text-center">
          <p class="text-sm text-muted-foreground">
            Already have an account? 
            <a routerLink="/login" class="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  readonly passwordStrength = computed(() => {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  });

  readonly strengthColor = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'bg-destructive';
    if (s === 2) return 'bg-yellow-500';
    if (s === 3) return 'bg-blue-500';
    return 'bg-green-500';
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[s] || 'Enter a password';
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const val = this.registerForm.getRawValue();

    const success = await this.store.register({
      email: val.email!,
      password: val.password!,
      firstName: val.firstName!,
      lastName: val.lastName!
    });

    if (success) {
      this.isLoading.set(false);
      this.router.navigate(['/login']);
    } else {
      this.isLoading.set(false);
      this.error.set('Registration failed. Email might be in use.');
    }
  }
}
