import { Injectable, inject, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { CatalogStateStore } from './catalog.store';
import { switchMap, map, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    sku: string;
    stockQuantity: number;
    imageUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class CatalogService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);
    readonly state = inject(CatalogStateStore);

    // Fallback to toSignal pattern for guaranteed stability
    private readonly request$ = combineLatest([
        toObservable(this.state.selectedCategory),
        toObservable(this.state.searchQuery)
    ]).pipe(
        switchMap(([category, search]) => {
            // Build query params here if needed
            return this.http.get<Product[]>(`${this.baseUrl}/api/products`).pipe(
                startWith([]) // Initial loading state empty
            );
        })
    );

    getProduct(id: string) {
        return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`);
    }

    readonly products = toSignal(this.request$, { initialValue: [] });
}
