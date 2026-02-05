import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../features/auth/auth.store';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(AuthStore);
    const token = store.token();

    let request = req;

    if (token) {
        request = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(request).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                console.warn('Auth Interceptor: 401 Unauthorized - Logging out');
                store.logout();
            }
            return throwError(() => err);
        })
    );
};
