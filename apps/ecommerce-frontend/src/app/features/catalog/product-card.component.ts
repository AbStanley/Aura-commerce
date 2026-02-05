import { Component, input, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { WishlistStore } from './wishlist.store';
import { AuthStore } from '../auth/auth.store';
import { GalleryAdapterService } from './gallery-adapter.service';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TooltipModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="surface-card border-1 surface-border border-round-md overflow-hidden h-full cursor-pointer relative hover:shadow-3 transition-duration-200 flex flex-column"
         (click)="navigateToProduct()">
      
      <!-- Image Section -->
      <div class="relative w-full bg-white p-3 flex align-items-center justify-content-center" style="height: 220px;">
        <img [src]="thumbnail()" 
             [alt]="product().name" 
             class="max-w-full max-h-full object-contain" 
             (error)="onImageError($event)">
        
        <!-- Out of Stock Overlay -->
        @if (product().stockQuantity === 0) {
            <div class="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center bg-white-alpha-50 z-2">
                <span class="text-red-600 font-bold uppercase text-sm border-1 border-red-600 bg-white px-2 py-1">Out of Stock</span>
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
                     (click)="$event.stopPropagation(); addToCart()"></button>
        </div>
        
        <!-- Wishlist (Small Link) -->
        <div class="mt-2 text-center">
             <a class="text-xs text-blue-600 hover:underline cursor-pointer"
               (click)="$event.stopPropagation(); toggleWishlist()">
               {{ isWishlisted() ? 'Remove from List' : 'Add to List' }}
             </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .p-button-warning:hover {
        background-color: #f7ca00 !important;
        border-color: #f2c200 !important;
    }
  `]
})
export class ProductCardComponent {
  protected readonly Math = Math;
  readonly product = input.required<Product>();
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  private readonly adapter = inject(GalleryAdapterService);
  private readonly router = inject(Router);
  private readonly msgService = inject(MessageService);

  private readonly authStore = inject(AuthStore);

  readonly isAdding = signal(false);

  thumbnail = computed(() => {
    return this.adapter.getImages(this.product().id, this.product().name)[0].thumbnailImageSrc;
  });

  isWishlisted = computed(() => {
    return this.wishlistStore.hasItem(this.product().id)();
  });

  navigateToProduct() {
    this.router.navigate(['/products', this.product().id]);
  }

  async toggleWishlist() {
    if (!this.authStore.isAuthenticated()) {
      this.msgService.add({
        severity: 'info',
        summary: 'Authentication Required',
        detail: 'Please login to add items to your wishlist',
        life: 3000
      });
      return;
    }

    const p = this.product();
    const added = await this.wishlistStore.toggleItem({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: this.thumbnail()
    });

    this.msgService.add({
      severity: added ? 'success' : 'info',
      summary: added ? 'Added to Wishlist' : 'Removed from Wishlist',
      detail: added ? `${p.name} is now in your favorites` : `${p.name} removed from favorites`,
      life: 2000
    });
  }

  async addToCart() {
    if (!this.product().stockQuantity || this.product().stockQuantity <= 0) return;

    this.isAdding.set(true);
    await this.cartStore.addItem(this.product(), 1);
    this.isAdding.set(false);

    this.msgService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `Added ${this.product().name} `,
      life: 2000
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://primefaces.org/cdn/primeng/images/usercard.png'; // Fallback
  }
}
