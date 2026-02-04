import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from './auth.store';
import { CommonModule } from '@angular/common';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    CheckboxModule,
    MessageModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center min-h-30rem py-6">
      <p-card class="w-full max-w-30rem animate-fade-in">
        <ng-template pTemplate="header">
          <div class="text-center p-4 pb-0">
            <i class="pi pi-user-plus text-4xl text-primary mb-3"></i>
            <h2 class="text-2xl font-bold m-0">Create Account</h2>
            <p class="text-500 mt-2 mb-0">Join us to start shopping</p>
          </div>
        </ng-template>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-column gap-4">
          <!-- Name Fields -->
          <div class="grid">
            <div class="col-6">
              <div class="flex flex-column gap-2">
                <label for="firstName" class="font-medium">First Name</label>
                <input id="firstName" type="text" pInputText formControlName="firstName" 
                       placeholder="John" class="w-full" />
              </div>
            </div>
            <div class="col-6">
              <div class="flex flex-column gap-2">
                <label for="lastName" class="font-medium">Last Name</label>
                <input id="lastName" type="text" pInputText formControlName="lastName" 
                       placeholder="Doe" class="w-full" />
              </div>
            </div>
          </div>

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
                        placeholder="Create a strong password"
                        [feedback]="true" 
                        [toggleMask]="true"
                        styleClass="w-full"
                        inputStyleClass="w-full"></p-password>
          </div>

          <!-- Terms -->
          <div class="flex align-items-center gap-2">
            <p-checkbox formControlName="acceptTerms" 
                        [binary]="true" 
                        inputId="terms"></p-checkbox>
            <label for="terms" class="text-500 text-sm">
              I agree to the <a href="#" class="text-primary">Terms</a> and 
              <a href="#" class="text-primary">Privacy Policy</a>
            </label>
          </div>

          <!-- Error -->
          @if (error()) {
            <p-message severity="error" [text]="error()!" styleClass="w-full"></p-message>
          }

          <!-- Submit -->
          <p-button type="submit" label="Create Account" 
                    [loading]="isLoading()" 
                    [disabled]="registerForm.invalid || isLoading()"
                    styleClass="w-full"></p-button>
        </form>

        <ng-template pTemplate="footer">
          <div class="text-center">
            <span class="text-500">Already have an account? </span>
            <a routerLink="/login" class="text-primary font-medium no-underline hover:underline">
              Sign in
            </a>
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .min-h-30rem { min-height: 30rem; }
    .max-w-30rem { max-width: 30rem; }
    .no-underline { text-decoration: none; }
    .hover\\:underline:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

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
