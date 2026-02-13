import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '../auth.store';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-auth-callback',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    templateUrl: './auth-callback.component.html',
    styleUrl: './auth-callback.component.scss'
})
export class AuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authStore = inject(AuthStore);

    ngOnInit() {
        // Capture token from query params (standard OAuth pattern)
        const token = this.route.snapshot.queryParamMap.get('token') ||
            this.route.snapshot.queryParamMap.get('access_token');
        const refresh = this.route.snapshot.queryParamMap.get('refresh') ||
            this.route.snapshot.queryParamMap.get('refresh_token');

        if (token && refresh) {
            this.authStore.handleExternalLogin(token, refresh);
            this.router.navigate(['/']);
        } else if (token) {
            // Fallback for cases where refresh token might be optional or missing (though backend sends it)
            this.authStore.handleExternalLogin(token, '');
            this.router.navigate(['/']);
        } else {
            const error = this.route.snapshot.queryParamMap.get('error');
            this.router.navigate(['/login'], { queryParams: { error: error || 'No token received' } });
        }
    }
}
