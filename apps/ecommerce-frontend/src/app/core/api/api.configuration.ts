import { InjectionToken, Provider } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export function provideApiConfiguration(): Provider {
    return { provide: API_BASE_URL, useValue: 'http://localhost:5000' };
}
