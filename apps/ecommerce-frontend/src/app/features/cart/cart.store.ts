import { inject, PLATFORM_ID } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withHooks, withComputed } from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, catchError, of, Observable } from 'rxjs';
import { computed } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export type CartItem = {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl?: string;
};

export type Cart = {
    id: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
};

type CartState = {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;
};

const initialState: CartState = {
    cart: null,
    isLoading: false,
    error: null
};

export const CartStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((store) => ({
        itemCount: computed(() => store.cart()?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0),
        totalPrice: computed(() => store.cart()?.totalPrice ?? 0)
    })),
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL), authStore = inject(AuthStore)) => ({

        loadCart(): Observable<Cart | null> {
            const userId = authStore.userId();
            if (!userId) {
                patchState(store, { cart: null });
                return of(null);
            }

            patchState(store, { isLoading: true });
            return http.get<Cart>(`${baseUrl}/api/cart?userId=${userId}`).pipe(
                tap({
                    next: (cart) => patchState(store, { cart, isLoading: false, error: null }),
                    error: (err) => patchState(store, { isLoading: false, error: 'Failed to load cart' })
                }),
                catchError(() => {
                    patchState(store, { isLoading: false, error: 'Failed to load cart' });
                    return of(null);
                })
            );
        },

        addItem(product: { id: string; name: string; price: number }, quantity: number = 1): Observable<Cart | null> {
            const userId = authStore.userId();
            if (!userId) return of(null);

            return http.post(`${baseUrl}/api/cart/items`, {
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity,
                userId
            }).pipe(
                switchMap(() => this.loadCart()),
                catchError(() => of(null))
            );
        },

        removeItem(productId: string): Observable<Cart | null> {
            const userId = authStore.userId();
            if (!userId) return of(null);

            return http.delete(`${baseUrl}/api/cart/items/${productId}?userId=${userId}`).pipe(
                switchMap(() => this.loadCart()),
                catchError(() => of(null))
            );
        },

        updateQuantity(productId: string, quantity: number): Observable<Cart | null> {
            const userId = authStore.userId();
            if (!userId) return of(null);

            if (quantity <= 0) return this.removeItem(productId);

            // FIX: Append productId to the URL for PUT request
            return http.put(`${baseUrl}/api/cart/items/${productId}`, { productId, quantity, userId }).pipe(
                switchMap(() => this.loadCart()),
                catchError(() => of(null))
            );
        },

        clearCart(): Observable<Cart | null> {
            const userId = authStore.userId();
            if (!userId) return of(null);

            return http.delete(`${baseUrl}/api/cart?userId=${userId}`).pipe(
                tap(() => patchState(store, { cart: null })),
                switchMap(() => of(null)), // Return null as cart is cleared
                catchError(() => of(null))
            );
        }
    })),
    withHooks({
        onInit: (store, authStore = inject(AuthStore)) => {
            // Load if user is already there
        }
    })
);
