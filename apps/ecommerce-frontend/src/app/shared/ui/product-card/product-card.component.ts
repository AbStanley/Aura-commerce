import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductImageService } from '../../services/product-image.service';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, TooltipModule],
    template: `
    <div class="surface-card border-1 surface-border border-round-md overflow-hidden h-full cursor-pointer relative hover:shadow-3 transition-duration-200 flex flex-column"
         (click)="onCardClick()">
      
      <!-- Image Section -->
      <div class="relative w-full bg-white p-3 flex align-items-center justify-content-center" style="height: 220px;">
        <img [src]="imageUrl()" 
             [alt]="product().name" 
             class="max-w-full max-h-full object-contain" 
             (error)="onImageError($event)">
        
        <!-- Out of Stock Overlay -->
        @if (product().stockQuantity === 0) {
            <div class="absolute top-0 left-0 w-full h-full z-2" style="background: rgba(255,255,255,0.7);">
                <div class="absolute" style="top: 12px; left: -30px; transform: rotate(-45deg); background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 4px 40px; font-size: 11px; font-weight: 700; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    Out of Stock
                </div>
            </div>
        }
      </div>

      <!-- Content -->
      <div class="p-3 flex flex-column flex-grow-1 gap-1">
        <!-- Title -->
        <h3 class="text-base font-normal text-900 m-0 line-height-3 max-h-3rem overflow-hidden text-overflow-ellipsis hover:text-primary transition-colors cursor-pointer"
            style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          {{ product().name }}
        </h3>
        
        <!-- Rating -->
        <div class="flex align-items-center gap-1 mb-1">
           <div class="flex text-yellow-500 text-xs">
              <i class="pi pi-star-fill"></i>
              <i class="pi pi-star-fill"></i>
              <i class="pi pi-star-fill"></i>
              <i class="pi pi-star-fill"></i>
              <i class="pi pi-star-half-fill"></i>
           </div>
           <span class="text-blue-600 text-xs hover:underline cursor-pointer">4,289</span>
        </div>

        <!-- Price -->
        <div class="mt-1">
            <div class="flex align-items-baseline gap-1">
                <span class="text-xs text-900 relative" style="top: -0.5em">$</span>
                <span class="text-2xl font-medium text-900">{{ Math.floor(product().price) }}</span>
                <span class="text-xs text-900 relative" style="top: -0.5em">{{ (product().price % 1).toFixed(2).substring(2) }}</span>
            </div>
             @if (product().price > 50) {
              <span class="text-xs text-500">List: <span class="line-through">{{ product().price * 1.2 | currency }}</span></span>
            }
        </div>

        <!-- Delivery Info -->
        <div class="text-xs text-500 mt-1">
            <span class="text-900 font-bold">Prime</span> <span class="text-500">Two-Day</span>
        </div>
        <div class="text-xs text-500">
            FREE delivery <span class="font-bold text-900">Mon, Feb 9</span>
        </div>

        <!-- Spacer -->
        <div class="flex-grow-1"></div>

        <!-- Action Button -->
        <div class="mt-3">
             <button pButton 
                     label="Add to Cart" 
                     class="p-button-warning w-full text-sm font-bold border-round-3xl"
                     style="background-color: #ffd814; border-color: #fcd200; color: #0f1111;"
                     [disabled]="isAdding() || !product().stockQuantity || product().stockQuantity <= 0"
                     (click)="$event.stopPropagation(); addToCart.emit(product())"></button>
        </div>
        
        <!-- Wishlist (Small Link) -->
        <div class="mt-2 text-center">
             <a class="text-xs text-blue-600 hover:underline cursor-pointer"
               (click)="$event.stopPropagation(); toggleWishlist.emit(product())">
               {{ isWishlisted() ? 'Remove from List' : 'Add to List' }}
             </a>
        </div>

      </div>
    </div>
  `,
    styles: [`
    :host { display: block; height: 100%; }
    :host:focus-visible .surface-card {
        outline: 2px solid var(--primary-color, #007bff);
        outline-offset: 2px;
    }
    .surface-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .surface-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    .p-button-warning:hover {
        background-color: #f7ca00 !important;
        border-color: #f2c200 !important;
    }
  `]
})
export class ProductCardComponent {
    protected readonly Math = Math;
    private readonly imageService = inject(ProductImageService);

    readonly product = input.required<Product>();
    readonly isAdding = input<boolean>(false);
    readonly isWishlisted = input<boolean>(false);

    readonly addToCart = output<Product>();
    readonly toggleWishlist = output<Product>();
    readonly cardClick = output<Product>();

    readonly imageUrl = computed(() =>
        this.imageService.getProductImage(this.product().id, this.product().name, this.product().imageUrl)
    );

    onCardClick() {
        this.cardClick.emit(this.product());
    }

    onImageError(event: any) {
        event.target.src = 'https://primefaces.org/cdn/primeng/images/usercard.png';
    }
}
