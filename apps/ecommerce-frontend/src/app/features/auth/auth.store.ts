import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

type UserState = {
    token: string | null;
    isAuthenticated: boolean;
    userEmail: string | null;
};

const initialState: UserState = {
    token: localStorage.getItem('access_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
    userEmail: null // In a real app, decode JWT to get email
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL)) => ({

        login(email: string, password: string) {
            // Using standard HttpClient for Actions (Login is not a Resource)
            return http.post<{ accessToken: string }>(`${baseUrl}/api/auth/login`, { email, password }).pipe(
                tap(response => {
                    localStorage.setItem('access_token', response.accessToken);
                    patchState(store, {
                        token: response.accessToken,
                        isAuthenticated: true,
                        userEmail: email
                    });
                })
            );
        },

        logout() {
            localStorage.removeItem('access_token');
            patchState(store, {
                token: null,
                isAuthenticated: false,
                userEmail: null
            });
        }
    }))
);
