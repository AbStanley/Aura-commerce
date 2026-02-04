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

export type PagedResult<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
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
            // Fetch first page, default size 20. 
            // Ideally we should support pagination in state, but for now fixed to page 1.
            const url = search
                ? `${this.baseUrl}/api/products/search?q=${search}` // Search endpoint might need pagination too eventually
                : `${this.baseUrl}/api/products?page=1&pageSize=20`;

            // If it's search, it returns Product[] (based on previous code). 
            // If it's GetAll, it returns PagedResult<Product>.
            // We need to handle both or unify.
            // The search endpoint returned List<ProductSearchDto> which is array.

            if (search) {
                return this.http.get<Product[]>(url).pipe(startWith([]));
            } else {
                return this.http.get<PagedResult<Product>>(url).pipe(
                    map(res => res.items),
                    startWith([])
                );
            }
        })
    );

    getProduct(id: string) {
        return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`);
    }

    readonly products = toSignal(this.request$, { initialValue: [] });
}
