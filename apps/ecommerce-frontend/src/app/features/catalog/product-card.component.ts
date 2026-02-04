import { Component, input, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { WishlistStore } from './wishlist.store';
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
    <div class="product-card surface-card border-round-xl overflow-hidden shadow-1 h-full cursor-pointer"
         (click)="navigateToProduct()">
      <!-- Image Section -->
      <div class="product-image relative overflow-hidden" style="height: 220px;">
        <img [src]="thumbnail()" [alt]="product().name" class="w-full h-full object-cover" 
             (error)="onImageError($event)">
        
        <!-- Out of Stock Overlay -->
        @if (product().stockQuantity === 0) {
            <div class="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center bg-black-alpha-50 z-2">
                <span class="bg-black-alpha-70 text-white px-3 py-1 border-round font-bold uppercase tracking-wider text-sm shadow-2">Out of Stock</span>
            </div>
        }

        <!-- Stock Badge (Low Stock) -->
        @if (product().stockQuantity > 0 && product().stockQuantity < 10) {
          <p-tag severity="warn" value="Low Stock" 
                 styleClass="absolute shadow-2 text-xs z-3" style="top: 12px; left: 12px;"></p-tag>
        }
        
        <!-- Discount Badge -->
        @if (product().price > 50) {
          <span class="absolute bg-green-500 text-white text-xs font-bold px-2 py-1 border-round shadow-2 z-3"
                style="top: 12px; right: 12px;">
            -20%
          </span>
        }
        
        <!-- Wishlist Button -->
        <button type="button" 
                class="absolute p-button p-button-rounded p-button-sm wishlist-btn z-4"
                [class.active]="isWishlisted()"
                style="bottom: 12px; right: 12px; width: 36px; height: 36px;"
                (click)="$event.stopPropagation(); toggleWishlist()"
                pTooltip="Add to wishlist">
          <i [class]="isWishlisted() ? 'pi pi-heart-fill text-red-500' : 'pi pi-heart text-700'" class="text-lg"></i>
        </button>
        
        <!-- Quick View Overlay -->
        <div class="quick-overlay absolute top-0 left-0 right-0 bottom-0 
                    flex align-items-end justify-content-center pb-4 z-1">
          <p-button icon="pi pi-eye" label="View Details" 
                    [rounded]="true" size="small"
                    styleClass="shadow-4 font-bold"
                    (click)="$event.stopPropagation(); navigateToProduct()"></p-button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3">
        <!-- Rating Placeholder -->
        <div class="flex gap-1 mb-2">
          @for (star of [1,2,3,4,5]; track star) {
            <i class="pi text-xs" [class]="star <= 4 ? 'pi-star-fill text-yellow-500' : 'pi-star text-300'"></i>
          }
          <span class="text-500 text-xs ml-1">(42)</span>
        </div>
        
        <span class="text-500 text-xs block mb-1 font-mono uppercase tracking-wider">{{ product().sku }}</span>
        <h3 class="text-base font-bold text-900 m-0 mb-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {{ product().name }}
        </h3>
        <p class="text-600 text-xs m-0 mb-3 line-height-3 overflow-hidden text-overflow-ellipsis" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.2rem;">
          {{ product().description }}
        </p>
        
        <div class="flex align-items-center justify-content-between pt-2 border-top-1 surface-border">
          <div class="flex flex-column">
            <span class="text-lg font-bold text-primary">{{ product().price | currency }}</span>
            @if (product().price > 50) {
              <span class="text-xs line-through text-500">{{ product().price * 1.25 | currency }}</span>
            }
          </div>
          <p-button 
            icon="pi pi-shopping-cart" 
            [loading]="isAdding()"
            [disabled]="isAdding() || !product().stockQuantity || product().stockQuantity <= 0"
            (onClick)="$event.stopPropagation(); addToCart()"
            pTooltip="Add to cart"
            tooltipPosition="top"
            [rounded]="true"
            severity="primary">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
    }
    .quick-overlay {
      background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .product-card:hover .quick-overlay {
      opacity: 1;
    }
    .wishlist-btn {
      background: rgba(255,255,255,0.9);
      border: none !important;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .wishlist-btn:hover {
      transform: scale(1.1);
      background: #ffffff;
    }
  `]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  private readonly cartStore = inject(CartStore);
  private readonly wishlistStore = inject(WishlistStore);
  private readonly adapter = inject(GalleryAdapterService);
  private readonly router = inject(Router);
  private readonly msgService = inject(MessageService);

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
      detail: `Added ${this.product().name}`,
      life: 2000
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://primefaces.org/cdn/primeng/images/usercard.png'; // Fallback
  }
}
