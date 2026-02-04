import { inject, PLATFORM_ID, computed } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withHooks, withComputed } from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

type UserState = {
    token: string | null;
    isAuthenticated: boolean;
    userEmail: string | null;
    userId: string | null;
};

const initialState: UserState = {
    token: null,
    isAuthenticated: false,
    userEmail: null,
    userId: null
};

// Helper to safely decode
function decodeToken(token: string): { email?: string; sub?: string } | null {
    try {
        return jwtDecode(token);
    } catch {
        return null;
    }
}

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState({ ...initialState, isLoading: false, error: null as string | null }),
    withComputed((store) => ({
    })),
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL), platformId = inject(PLATFORM_ID)) => ({

        async login(email: string, password: string): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const response = await firstValueFrom(
                    http.post<{ accessToken: string }>(`${baseUrl}/api/auth/login`, { email, password })
                );

                const decoded = decodeToken(response.accessToken);
                if (isPlatformBrowser(platformId)) {
                    localStorage.setItem('access_token', response.accessToken);
                }
                patchState(store, {
                    token: response.accessToken,
                    isAuthenticated: true,
                    userEmail: decoded?.email ?? email,
                    userId: decoded?.sub ?? null,
                    isLoading: false
                });
                return true;
            } catch (err) {
                patchState(store, { isLoading: false, error: 'Invalid email or password' });
                return false;
            }
        },

        async register(payload: { email: string; password: string; firstName: string; lastName: string }): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                await firstValueFrom(
                    http.post<{ userId: string }>(`${baseUrl}/api/auth/register`, payload)
                );
                patchState(store, { isLoading: false });
                return true;
            } catch (err) {
                patchState(store, { isLoading: false, error: 'Registration failed' });
                return false;
            }
        },

        logout() {
            if (isPlatformBrowser(platformId)) {
                localStorage.removeItem('access_token');
            }
            patchState(store, {
                token: null,
                isAuthenticated: false,
                userEmail: null,
                userId: null,
                error: null
            });
            inject(Router).navigate(['/login']);
        },

        // Helper to init from storage
        initFromStorage() {
            if (isPlatformBrowser(platformId)) {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const decoded = decodeToken(token);
                    patchState(store, {
                        token,
                        isAuthenticated: true,
                        userEmail: decoded?.email ?? null,
                        userId: decoded?.sub ?? null
                    });
                }
            }
        }
    })),
    withHooks({
        onInit: (store) => {
            store.initFromStorage();
        }
    })
);
