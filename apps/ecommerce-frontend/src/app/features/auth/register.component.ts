import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from './auth.store';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
            Create an account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Already have an account?
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                  <input id="firstName" formControlName="firstName" type="text" required 
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                  <input id="lastName" formControlName="lastName" type="text" required 
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
             </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" formControlName="email" type="email" required 
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" formControlName="password" type="password" required 
                class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
               <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
            </div>
          </div>

          @if (error()) {
             <div class="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
               {{ error() }}
             </div>
          }

          <div>
            <button 
              type="submit" 
              [disabled]="registerForm.invalid || isLoading()"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (isLoading()) {
                Creating Account...
              } @else {
                Register
              }
            </button>
          </div>
        </form>
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

    readonly registerForm = this.fb.group({
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.isLoading.set(true);
        this.error.set(null);

        const val = this.registerForm.getRawValue();

        this.store.register({
            email: val.email!,
            password: val.password!,
            firstName: val.firstName!,
            lastName: val.lastName!
        }).subscribe({
            next: () => {
                this.isLoading.set(false);
                // Navigate to login after successful registration
                this.router.navigate(['/login']);
            },
            error: (err) => {
                console.error('Registration failed', err);
                this.isLoading.set(false);
                this.error.set('Registration failed. Email might be in use.');
            }
        });
    }
}
