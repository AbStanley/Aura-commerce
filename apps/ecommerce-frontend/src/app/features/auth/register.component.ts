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
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-register',
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
    CheckboxModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center py-8">
      <div class="surface-card border-round-xl shadow-4 p-5 w-full animate-fade-in" style="max-width: 450px;">
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="flex justify-content-center mb-3">
            <div class="flex align-items-center justify-content-center bg-green-100 border-round-xl" 
                 style="width: 64px; height: 64px;">
              <i class="pi pi-user-plus text-green-600 text-4xl"></i>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-900 m-0 mb-2">Create Account</h2>
          <p class="text-500 m-0">Join us and start shopping today</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <!-- Name Fields -->
          <div class="grid">
            <div class="col-6">
              <div class="flex flex-column gap-2">
                <label for="firstName" class="font-medium text-900">First Name</label>
                <input id="firstName" type="text" pInputText formControlName="firstName" 
                       placeholder="John" class="w-full" />
              </div>
            </div>
            <div class="col-6">
              <div class="flex flex-column gap-2">
                <label for="lastName" class="font-medium text-900">Last Name</label>
                <input id="lastName" type="text" pInputText formControlName="lastName" 
                       placeholder="Doe" class="w-full" />
              </div>
            </div>
          </div>

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
                        placeholder="Create a strong password"
                        [feedback]="true"
                        [toggleMask]="true"
                        styleClass="w-full"
                        inputStyleClass="w-full"
                        promptLabel="Enter password"
                        weakLabel="Weak"
                        mediumLabel="Medium"
                        strongLabel="Strong"></p-password>
          </div>

          <!-- Terms -->
          <div class="flex align-items-center gap-2">
            <p-checkbox formControlName="acceptTerms" [binary]="true" inputId="terms"></p-checkbox>
            <label for="terms" class="text-500 cursor-pointer">
              I agree to the <a href="#" class="text-primary no-underline font-medium">Terms of Service</a> 
              and <a href="#" class="text-primary no-underline font-medium">Privacy Policy</a>
            </label>
          </div>

          <!-- Error -->
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full"></p-message>
          }

          <!-- Submit -->
          <p-button type="submit" label="Create Account" 
                    icon="pi pi-user-plus"
                    [loading]="isLoading()" 
                    [disabled]="registerForm.invalid || isLoading()"
                    styleClass="w-full"></p-button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-5">
          <span class="text-500">Already have an account? </span>
          <a routerLink="/login" class="text-primary font-medium no-underline hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .no-underline { text-decoration: none; }
    .hover\\:underline:hover { text-decoration: underline; }
    .cursor-pointer { cursor: pointer; }
  `]
})
export class RegisterComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, Validators.requiredTrue]
  });

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { firstName, lastName, email, password } = this.registerForm.getRawValue();
    const success = await this.authStore.register({
      email: email!,
      password: password!,
      firstName: firstName!,
      lastName: lastName!
    });

    if (success) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Registration failed. Please try again.');
    }

    this.isLoading.set(false);
  }
}
