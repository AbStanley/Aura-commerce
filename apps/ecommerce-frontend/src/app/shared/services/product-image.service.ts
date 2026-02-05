import { Injectable } from '@angular/core';

export type GalleryImage = {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
    title: string;
};

@Injectable({ providedIn: 'root' })
export class ProductImageService {
    private readonly stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'with', 'for', 'of', 'to', 'x', 'pro', 'air']);

    /**
     * Deterministically generate high-quality placeholder images based on product ID and Name
     */
    getImages(productId: string, productName: string = 'product'): GalleryImage[] {
        const filteredKeywords = this.getFilteredKeywords(productName);
        const category = this.guessCategory(productName);
        const searchTags = `${filteredKeywords},${category}`;

        const baseImages = [
            `https://loremflickr.com/800/600/${encodeURIComponent(searchTags)}?lock=${productId.charCodeAt(0)}`,
            `https://loremflickr.com/800/600/${encodeURIComponent(searchTags)}?lock=${productId.charCodeAt(1)}`,
            `https://loremflickr.com/800/600/${encodeURIComponent(searchTags)}?lock=${productId.charCodeAt(2)}`,
            `https://loremflickr.com/800/600/${encodeURIComponent(category)}?lock=${productId.charCodeAt(3)}`
        ];

        return baseImages.map((src, index) => ({
            itemImageSrc: src,
            thumbnailImageSrc: src,
            alt: `${productName} Image ${index + 1}`,
            title: `${productName} View ${index + 1}`
        }));
    }

    /**
     * Get a single representative image for a product
     */
    getProductImage(productId: string, productName: string, existingUrl?: string): string {
        if (existingUrl) return existingUrl;

        const filteredKeywords = this.getFilteredKeywords(productName);
        const category = this.guessCategory(productName);
        const searchTags = `${filteredKeywords},${category}`;

        return `https://loremflickr.com/400/400/${encodeURIComponent(searchTags)}?lock=${productId.charCodeAt(0)}`;
    }

    private getFilteredKeywords(name: string): string {
        return name.toLowerCase()
            .split(/\s+/)
            .filter(w => !this.stopWords.has(w) && w.length > 2)
            .slice(0, 2)
            .join(',');
    }

    private guessCategory(name: string): string {
        const lower = name.toLowerCase();
        if (lower.includes('book') || lower.includes('programmer') || lower.includes('code') || lower.includes('design')) return 'book';
        if (lower.includes('shirt') || lower.includes('jeans') || lower.includes('jacket') || lower.includes('hoodie') || lower.includes('shoes')) return 'fashion';
        if (lower.includes('fryer') || lower.includes('blender') || lower.includes('coffee') || lower.includes('vacuum') || lower.includes('kitchen')) return 'kitchen,home';
        if (lower.includes('phone') || lower.includes('laptop') || lower.includes('watch') || lower.includes('audio') || lower.includes('earbuds') || lower.includes('monitor') || lower.includes('mouse') || lower.includes('keyboard')) return 'tech,gadget';
        return 'product';
    }
}
