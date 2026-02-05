import { Injectable, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { CatalogStateStore } from './catalog.store';
import { switchMap, map, startWith, tap } from 'rxjs/operators';
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

export type Category = {
    id: string;
    name: string;
    description: string;
    parentCategoryId?: string;
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

    // Categories signal
    private readonly _categories = signal<Category[]>([]);
    readonly categories = this._categories.asReadonly();

    // Products request with category filtering
    private readonly request$ = combineLatest([
        toObservable(this.state.selectedCategory),
        toObservable(this.state.searchQuery)
    ]).pipe(
        tap(([category, search]) => console.log('[CatalogService] Filter changed:', { category, search })),
        switchMap(([category, search]) => {
            if (search) {
                const url = `${this.baseUrl}/api/products/search?q=${search}`;
                console.log('[CatalogService] Search URL:', url);
                return this.http.get<Product[]>(url).pipe(startWith([]));
            } else {
                let url = `${this.baseUrl}/api/products?page=1&pageSize=20`;
                if (category) {
                    url += `&categoryId=${category}`;
                }
                console.log('[CatalogService] Products URL:', url);
                return this.http.get<PagedResult<Product>>(url).pipe(
                    map(res => res.items),
                    startWith([])
                );
            }
        })
    );

    readonly products = toSignal(this.request$, { initialValue: [] });

    constructor() {
        this.loadCategories();
    }

    loadCategories() {
        this.http.get<Category[]>(`${this.baseUrl}/api/categories`)
            .subscribe(cats => this._categories.set(cats));
    }

    getProduct(id: string) {
        return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`);
    }
}
