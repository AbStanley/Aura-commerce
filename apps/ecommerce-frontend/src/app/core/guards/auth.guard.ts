import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    authStore.verifyFromStorage();

    if (authStore.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};
