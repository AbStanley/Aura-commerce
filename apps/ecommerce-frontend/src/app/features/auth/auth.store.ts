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
    refreshToken: string | null;
    isAuthenticated: boolean;
    userEmail: string | null;
    userId: string | null;
};

const initialState: UserState = {
    token: null,
    refreshToken: null,
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
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL), platformId = inject(PLATFORM_ID), router = inject(Router)) => ({

        async login(email: string, password: string): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                const response = await firstValueFrom(
                    http.post<{ accessToken: string; refreshToken: string }>(`${baseUrl}/api/auth/login`, { email, password })
                );

                const decoded = decodeToken(response.accessToken);
                if (isPlatformBrowser(platformId)) {
                    localStorage.setItem('access_token', response.accessToken);
                    localStorage.setItem('refresh_token', response.refreshToken);
                }
                patchState(store, {
                    token: response.accessToken,
                    refreshToken: response.refreshToken,
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
                localStorage.removeItem('refresh_token');
            }
            patchState(store, {
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                userEmail: null,
                userId: null,
                error: null
            });
            router.navigate(['/login']);
        },

        handleExternalLogin(accessToken: string, refreshToken: string) {
            const decoded = decodeToken(accessToken);
            if (isPlatformBrowser(platformId)) {
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
            }
            patchState(store, {
                token: accessToken,
                refreshToken: refreshToken,
                isAuthenticated: true,
                userEmail: decoded?.email ?? null,
                userId: decoded?.sub ?? null,
                isLoading: false
            });
        },

        // Helper to init from storage
        initFromStorage() {
            if (isPlatformBrowser(platformId)) {
                const token = localStorage.getItem('access_token');
                const refreshToken = localStorage.getItem('refresh_token');
                if (token) {
                    const decoded = decodeToken(token);
                    patchState(store, {
                        token,
                        refreshToken: refreshToken ?? null,
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
