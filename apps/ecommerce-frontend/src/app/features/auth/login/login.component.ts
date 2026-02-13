import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../auth.store';
import { CommonModule } from '@angular/common';
import { API_BASE_URL } from '../../../core/api/api.configuration';

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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = inject(API_BASE_URL);

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
    window.location.href = `${this.apiUrl}/api/auth/external-login/Google`;
  }

  onGithubLogin() {
    window.location.href = `${this.apiUrl}/api/auth/external-login/GitHub`;
  }
}
