import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { AuthStore } from '../auth/auth.store';
import { tap, firstValueFrom } from 'rxjs';

export type WishlistItem = {
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    addedAt: Date;
};

@Injectable({
    providedIn: 'root'
})
export class WishlistStore {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);
    private readonly authStore = inject(AuthStore);
    private readonly platformId = inject(PLATFORM_ID);

    private readonly wishlistIdsSignal = signal<Set<string>>(new Set());

    // For the UI list (local cache of details adding/removing)
    private readonly itemsSignal = signal<WishlistItem[]>([]);

    // Selectors
    readonly count = computed(() => this.wishlistIdsSignal().size);

    constructor() {
        this.init();
    }

    // React to auth changes
    private init() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.authStore.isAuthenticated()) {
                this.loadFromBackend();
            }
        }
    }

    hasItem(productId: string) {
        return computed(() => this.wishlistIdsSignal().has(productId));
    }

    async loadFromBackend() {
        if (!this.authStore.isAuthenticated()) return;

        try {
            const ids = await firstValueFrom(this.http.get<string[]>(`${this.baseUrl}/api/wishlist`));
            this.wishlistIdsSignal.set(new Set(ids));
        } catch (err) {
            console.error('Failed to load wishlist', err);
        }
    }

    async toggleItem(product: { id: string; name: string; price: number; imageUrl?: string }) {
        if (!this.authStore.isAuthenticated()) {
            return false;
        }

        const currentIds = this.wishlistIdsSignal();
        const exists = currentIds.has(product.id);
        const newIds = new Set(currentIds);

        try {
            if (exists) {
                await firstValueFrom(this.http.delete(`${this.baseUrl}/api/wishlist/${product.id}`));
                newIds.delete(product.id);
            } else {
                await firstValueFrom(this.http.post(`${this.baseUrl}/api/wishlist/${product.id}`, {}));
                newIds.add(product.id);
            }
            this.wishlistIdsSignal.set(newIds);
            return !exists;
        } catch (err) {
            console.error('Failed to toggle wishlist item', err);
            return exists; // Revert visually
        }
    }

    // For the Wishlist Page
    getIds() {
        return Array.from(this.wishlistIdsSignal());
    }
}
