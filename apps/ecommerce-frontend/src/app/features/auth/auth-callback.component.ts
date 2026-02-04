import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    template: `
    <div class="flex flex-column align-items-center justify-content-center min-h-screen">
      <p-progressSpinner></p-progressSpinner>
      <p class="mt-4 text-600">Completing login...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authStore = inject(AuthStore);

    ngOnInit() {
        // Capture token from query params (standard OAuth pattern)
        // Adjust parameter name based on backend implementation (usually 'token' or 'access_token')
        const token = this.route.snapshot.queryParamMap.get('token') ||
            this.route.snapshot.queryParamMap.get('access_token');

        if (token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', token);
            }
            // Force store re-init to pick up new token
            this.authStore.initFromStorage();
            this.router.navigate(['/']);
        } else {
            this.router.navigate(['/login'], { queryParams: { error: 'No token received' } });
        }
    }
}
