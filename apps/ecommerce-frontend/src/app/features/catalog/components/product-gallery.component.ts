import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryImage } from '../../../shared/services/product-image.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-product-gallery',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    template: `
    <div class="surface-card shadow-1 border-round-xl overflow-hidden p-3">
        <!-- Main Image -->
        <div class="mb-3 relative w-full h-30rem border-round-xl overflow-hidden cursor-pointer" 
            style="background-color: #f8f9fa;">
            @if (images().length > 0) {
                <img [src]="images()[activeIndex()].itemImageSrc" 
                    [alt]="images()[activeIndex()].alt"
                    class="w-full h-full object-cover animate-fade-in"
                    style="transition: transform 0.3s ease;" />
                
                <button pButton icon="pi pi-chevron-left" 
                        class="p-button-rounded p-button-text p-button-secondary absolute left-0 top-50 -mt-3 ml-2 surface-0 shadow-2 opacity-70 hover:opacity-100"
                        (click)="prevImage(); $event.stopPropagation()"
                        [disabled]="activeIndex() === 0"></button>
                <button pButton icon="pi pi-chevron-right" 
                        class="p-button-rounded p-button-text p-button-secondary absolute right-0 top-50 -mt-3 mr-2 surface-0 shadow-2 opacity-70 hover:opacity-100"
                        (click)="nextImage(); $event.stopPropagation()"
                        [disabled]="activeIndex() === images().length - 1"></button>
            }
        </div>

        <!-- Thumbnails -->
        <div class="flex gap-2 overflow-x-auto pb-1" style="scroll-behavior: smooth;">
            @for (item of images(); track item.itemImageSrc; let i = $index) {
                <div class="flex-shrink-0 cursor-pointer border-round-lg overflow-hidden transition-all transition-duration-200"
                    style="width: 80px; height: 80px;"
                    [style.box-shadow]="activeIndex() === i ? '0 0 0 2px var(--primary-color)' : 'none'"
                    [class.opacity-60]="activeIndex() !== i"
                    [class.opacity-100]="activeIndex() === i"
                    (click)="setIndex(i)">
                    <img [src]="item.thumbnailImageSrc" 
                        [alt]="item.alt" 
                        class="w-full h-full object-cover" />
                </div>
            }
        </div>
    </div>
  `
})
export class ProductGalleryComponent {
    images = input.required<GalleryImage[]>();
    activeIndex = signal(0);

    setIndex(index: number) {
        this.activeIndex.set(index);
    }

    prevImage() {
        if (this.activeIndex() > 0) {
            this.activeIndex.update(i => i - 1);
        }
    }

    nextImage() {
        if (this.activeIndex() < this.images().length - 1) {
            this.activeIndex.update(i => i + 1);
        }
    }
}
