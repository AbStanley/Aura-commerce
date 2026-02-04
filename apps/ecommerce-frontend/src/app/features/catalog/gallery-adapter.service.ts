import { Injectable } from '@angular/core';

export type GalleryImage = {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
    title: string;
};

@Injectable({ providedIn: 'root' })
export class GalleryAdapterService {

    // Deterministically generate high-quality placeholder images based on product ID
    getImages(productId: string): GalleryImage[] {
        // Simple hash to toggle between different image sets
        const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const setIndex = hash % 5;

        // Using placeholder services that support specific keyword/ID for consistency
        // Ideally these would be real product images from the backend

        const baseImages = [
            `https://picsum.photos/seed/${productId}-1/800/600`,
            `https://picsum.photos/seed/${productId}-2/800/600`,
            `https://picsum.photos/seed/${productId}-3/800/600`,
            `https://picsum.photos/seed/${productId}-4/800/600`
        ];

        return baseImages.map((src, index) => ({
            itemImageSrc: src,
            thumbnailImageSrc: src, // in real app, these would be smaller optimized versions
            alt: `Product Image ${index + 1}`,
            title: `View ${index + 1}`
        }));
    }
}
