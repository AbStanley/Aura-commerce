import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { Observable } from 'rxjs';

export type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
};

export type UpdateProfileRequest = {
    firstName: string;
    lastName: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    getProfile(userId: string): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.baseUrl}/api/users/${userId}`);
    }

    updateProfile(userId: string, request: UpdateProfileRequest): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/api/users/${userId}`, request);
    }
}
