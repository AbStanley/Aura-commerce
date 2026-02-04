import { inject, PLATFORM_ID } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withHooks, withComputed } from '@ngrx/signals';
import { rxResource } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, catchError, of, Observable, firstValueFrom } from 'rxjs';
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
    userId: string;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
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
        itemCount: computed(() => store.cart()?.totalItems ?? 0),
        totalPrice: computed(() => store.cart()?.totalAmount ?? 0)
    })),
    withMethods((store, http = inject(HttpClient), baseUrl = inject(API_BASE_URL), authStore = inject(AuthStore)) => ({

        async loadCart(): Promise<void> {
            const userId = authStore.userId();
            if (!userId) {
                patchState(store, { cart: null });
                return;
            }

            patchState(store, { isLoading: true });
            try {
                const cart = await firstValueFrom(
                    http.get<Cart>(`${baseUrl}/api/cart?userId=${userId}`)
                );
                patchState(store, { cart, isLoading: false, error: null });
            } catch (error) {
                patchState(store, { isLoading: false, error: 'Failed to load cart' });
            }
        },

        async addItem(product: { id: string; name: string; price: number }, quantity: number = 1): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(
                    http.post(`${baseUrl}/api/cart/items`, {
                        productId: product.id,
                        productName: product.name,
                        unitPrice: product.price,
                        quantity,
                        userId
                    })
                );
                await this.loadCart();
            } catch (error) {
                // error handled
            }
        },

        async updateQuantity(productId: string, quantity: number): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            if (quantity <= 0) {
                await this.removeItem(productId);
                return;
            }

            try {
                await firstValueFrom(
                    http.put(`${baseUrl}/api/cart/items/${productId}`, { productId, quantity, userId })
                );
                await this.loadCart();
            } catch (error) {
                // error handled
            }
        },

        async removeItem(productId: string): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(
                    http.delete(`${baseUrl}/api/cart/items/${productId}?userId=${userId}`)
                );
                await this.loadCart();
            } catch (error) {
                // error handled
            }
        },

        async clearCart(): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(
                    http.delete(`${baseUrl}/api/cart?userId=${userId}`)
                );
                patchState(store, { cart: null });
            } catch (error) {
                // error handled
            }
        }
    })),
    withHooks({
        onInit: (store, authStore = inject(AuthStore)) => {
            // Load if user is already there
        }
    })
);
