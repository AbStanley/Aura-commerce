import { Injectable, signal, computed, inject, PLATFORM_ID, EffectRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
    private readonly platformId = inject(PLATFORM_ID);

    // State
    private readonly itemsSignal = signal<WishlistItem[]>([]);

    // Selectors
    readonly items = this.itemsSignal.asReadonly();
    readonly count = computed(() => this.itemsSignal().length);

    constructor() {
        this.loadFromStorage();
    }

    hasItem(productId: string) {
        return computed(() => this.itemsSignal().some(i => i.productId === productId));
    }

    loadFromStorage() {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem('wishlist');
            if (stored) {
                try {
                    const items = JSON.parse(stored);
                    this.itemsSignal.set(items);
                } catch {
                    localStorage.removeItem('wishlist');
                }
            }
        }
    }

    saveToStorage(items: WishlistItem[]) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('wishlist', JSON.stringify(items));
        }
    }

    toggleItem(product: { id: string; name: string; price: number; imageUrl?: string }) {
        const currentItems = this.itemsSignal();
        const exists = currentItems.some(i => i.productId === product.id);

        let newItems;
        if (exists) {
            newItems = currentItems.filter(i => i.productId !== product.id);
        } else {
            newItems = [...currentItems, {
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.imageUrl,
                addedAt: new Date()
            }];
        }

        this.itemsSignal.set(newItems);
        this.saveToStorage(newItems);
        return !exists;
    }
}
