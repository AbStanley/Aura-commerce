import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Review = {
    id: string;
    productId: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
    verified: boolean;
};

// Generate deterministic mock reviews
const MOCK_REVIEWS = [
    { userName: "Alex Thompson", rating: 5, comment: "Absolutely love this! High quality build.", verified: true },
    { userName: "Sarah Jenkins", rating: 4, comment: "Great product, fast shipping.", verified: true },
    { userName: "Michael Chen", rating: 5, comment: "Exceeded my expectations. Will buy again.", verified: true },
    { userName: "Jessica Low", rating: 3, comment: "Decent, but expected a bit more for the price.", verified: false }
];

@Injectable({
    providedIn: 'root'
})
export class ReviewStore {
    private readonly platformId = inject(PLATFORM_ID);

    // State: productId -> reviews
    private readonly reviewsSignal = signal<Record<string, Review[]>>({});

    // Selectors
    getReviews(productId: string) {
        return computed(() => this.reviewsSignal()[productId] || []);
    }

    getAverageRating(productId: string) {
        return computed(() => {
            const reviews = this.reviewsSignal()[productId] || [];
            if (reviews.length === 0) return 0;
            return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        });
    }

    getReviewCount(productId: string) {
        return computed(() => (this.reviewsSignal()[productId] || []).length);
    }

    loadReviews(productId: string) {
        if (this.reviewsSignal()[productId]) return;

        // Simulate backend delay and mock generation
        const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const count = (hash % 5) + 2;

        const productReviews: Review[] = [];

        // 1. Add generated mocks
        for (let i = 0; i < count; i++) {
            const template = MOCK_REVIEWS[(hash + i) % MOCK_REVIEWS.length];
            productReviews.push({
                id: `mock-${productId}-${i}`,
                productId,
                userName: template.userName,
                rating: template.rating,
                comment: template.comment,
                verified: template.verified,
                date: new Date(Date.now() - (hash * 1000 * 60 * 60 * 24))
            });
        }

        // 2. Add local user reviews
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem(`reviews-${productId}`);
            if (stored) {
                try {
                    const localReviews = JSON.parse(stored);
                    productReviews.unshift(...localReviews);
                } catch { }
            }
        }

        this.reviewsSignal.update(state => ({
            ...state,
            [productId]: productReviews
        }));
    }

    addReview(productId: string, rating: number, comment: string, userName: string) {
        const newReview: Review = {
            id: crypto.randomUUID(),
            productId,
            userName,
            rating,
            comment,
            date: new Date(),
            verified: true
        };

        // Update State
        this.reviewsSignal.update(state => {
            const current = state[productId] || [];
            return {
                ...state,
                [productId]: [newReview, ...current]
            };
        });

        // Persist to local storage
        if (isPlatformBrowser(this.platformId)) {
            const key = `reviews-${productId}`;
            const stored = localStorage.getItem(key);
            const localReviews = stored ? JSON.parse(stored) : [];
            localReviews.unshift(newReview);
            localStorage.setItem(key, JSON.stringify(localReviews));
        }
    }
}
