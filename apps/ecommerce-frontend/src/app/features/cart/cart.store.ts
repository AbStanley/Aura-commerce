import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withHooks, withComputed } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { computed } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { CartService } from './cart.service';

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
    withMethods((store, cartService = inject(CartService), authStore = inject(AuthStore)) => ({

        async loadCart(): Promise<void> {
            const userId = authStore.userId();
            if (!userId) {
                patchState(store, { cart: null });
                return;
            }

            patchState(store, { isLoading: true });
            try {
                const cart = await firstValueFrom(cartService.getCart(userId));
                patchState(store, { cart, isLoading: false, error: null });
            } catch (error) {
                patchState(store, { isLoading: false, error: 'Failed to load cart' });
            }
        },

        async addItem(product: { id: string; name: string; price: number }, quantity: number = 1): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(cartService.addItem(userId, product, quantity));
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
                await firstValueFrom(cartService.updateQuantity(userId, productId, quantity));
                await this.loadCart();
            } catch (error) {
                // error handled
            }
        },

        async removeItem(productId: string): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(cartService.removeItem(userId, productId));
                await this.loadCart();
            } catch (error) {
                // error handled
            }
        },

        async clearCart(): Promise<void> {
            const userId = authStore.userId();
            if (!userId) return;

            try {
                await firstValueFrom(cartService.clearCart(userId));
                patchState(store, { cart: null });
            } catch (error) {
            }
        }
    })),
    withHooks({
        onInit: (store, authStore = inject(AuthStore)) => {
        }
    })
);
