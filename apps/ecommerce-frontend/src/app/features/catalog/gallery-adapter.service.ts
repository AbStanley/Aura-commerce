import { Injectable } from '@angular/core';

export type GalleryImage = {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
    title: string;
};

@Injectable({ providedIn: 'root' })
export class GalleryAdapterService {

    // Deterministically generate high-quality placeholder images based on product ID and Name
    getImages(productId: string, productName: string = 'product'): GalleryImage[] {
        const keywords = productName.split(' ').slice(0, 2).join(',');
        const encodedKeywords = encodeURIComponent(keywords);

        // Use a consistent service that supports keywords (LoremFlickr or similar)
        // Adding random param to ensure different images for same keywords but consistent per page load if possible
        // Note: For a real consistent experience without backend, we'd hash the ID to pick a static set.
        // But for "related" images, keywords are key.

        const baseImages = [
            `https://loremflickr.com/800/600/${encodedKeywords}?lock=${productId.charCodeAt(0)}`,
            `https://loremflickr.com/800/600/${encodedKeywords}?lock=${productId.charCodeAt(1)}`,
            `https://loremflickr.com/800/600/${encodedKeywords}?lock=${productId.charCodeAt(2)}`,
            `https://loremflickr.com/800/600/technology?lock=${productId.charCodeAt(3)}` // Fallback/Generic
        ];

        return baseImages.map((src, index) => ({
            itemImageSrc: src,
            thumbnailImageSrc: src,
            alt: `${productName} Image ${index + 1}`,
            title: `${productName} View ${index + 1}`
        }));
    }
}
