import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/auth';

    // Simple signal for auth state
    isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

    login(credentials: { username: string, password: string }): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    this.isAuthenticated.set(true);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.isAuthenticated.set(false);
    }
}
