import { inject, PLATFORM_ID, computed } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withHooks, withComputed } from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
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
    withState(initialState),
    withComputed((store) => ({
        // Exposed computed values if needed specifically
    })),
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL), platformId = inject(PLATFORM_ID)) => ({

        login(email: string, password: string) {
            return http.post<{ accessToken: string }>(`${baseUrl}/api/auth/login`, { email, password }).pipe(
                tap(response => {
                    const decoded = decodeToken(response.accessToken);
                    if (isPlatformBrowser(platformId)) {
                        localStorage.setItem('access_token', response.accessToken);
                    }
                    patchState(store, {
                        token: response.accessToken,
                        isAuthenticated: true,
                        userEmail: decoded?.email ?? email,
                        userId: decoded?.sub ?? null
                    });
                })
            );
        },

        register(payload: { email: string; password: string; firstName: string; lastName: string }) {
            return http.post<{ userId: string }>(`${baseUrl}/api/auth/register`, payload);
        },

        logout() {
            if (isPlatformBrowser(platformId)) {
                localStorage.removeItem('access_token');
            }
            patchState(store, {
                token: null,
                isAuthenticated: false,
                userEmail: null,
                userId: null
            });
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
