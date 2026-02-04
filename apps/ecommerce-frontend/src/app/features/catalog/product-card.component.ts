import { Component, input, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';

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
    <div class="product-card surface-card border-round-xl overflow-hidden shadow-1 h-full cursor-pointer"
         (click)="navigateToProduct()">
      <!-- Image Section -->
      <div class="product-image relative overflow-hidden" style="height: 200px;">
        <div class="w-full h-full flex align-items-center justify-content-center surface-100">
          <i class="pi pi-box text-6xl text-300"></i>
        </div>
        
        <!-- Stock Badge -->
        @if (product().stockQuantity && product().stockQuantity < 10) {
          <p-tag severity="warn" value="Low Stock" 
                 styleClass="absolute shadow-2" style="top: 12px; left: 12px;"></p-tag>
        }
        
        <!-- Discount Badge -->
        @if (product().price > 50) {
          <span class="absolute bg-red-500 text-white text-xs font-bold px-2 py-1 border-round shadow-2"
                style="top: 12px; right: 12px;">
            -20%
          </span>
        }
        
        <!-- Wishlist Button -->
        <button type="button" 
                class="absolute p-button p-button-rounded p-button-sm wishlist-btn"
                [class.active]="isWishlisted()"
                style="bottom: 12px; right: 12px; background: rgba(255,255,255,0.95); width: 36px; height: 36px;"
                (click)="$event.stopPropagation(); toggleWishlist()"
                pTooltip="Add to wishlist">
          <i [class]="isWishlisted() ? 'pi pi-heart-fill text-red-500' : 'pi pi-heart text-500'"></i>
        </button>
        
        <!-- Quick View Overlay -->
        <div class="quick-overlay absolute top-0 left-0 right-0 bottom-0 
                    flex align-items-end justify-content-center pb-4">
          <p-button icon="pi pi-eye" label="Quick View" 
                    [rounded]="true" size="small"
                    styleClass="shadow-4"
                    (click)="$event.stopPropagation(); navigateToProduct()"></p-button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3">
        <!-- Rating -->
        <div class="flex gap-1 mb-2">
          @for (star of [1,2,3,4,5]; track star) {
            <i class="pi text-xs" [class]="star <= 4 ? 'pi-star-fill text-yellow-500' : 'pi-star text-300'"></i>
          }
          <span class="text-400 text-xs ml-1">(42)</span>
        </div>
        
        <span class="text-500 text-xs block mb-1 font-mono">{{ product().sku }}</span>
        <h3 class="text-base font-semibold text-900 m-0 mb-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {{ product().name }}
        </h3>
        <p class="text-500 text-xs m-0 mb-3 line-height-3 overflow-hidden" style="max-height: 2.2rem;">
          {{ product().description }}
        </p>
        
        <div class="flex align-items-center justify-content-between">
          <div class="flex flex-column">
            <span class="text-xl font-bold text-primary">{{ product().price | currency }}</span>
            @if (product().price > 50) {
              <span class="text-xs line-through text-400">{{ product().price * 1.25 | currency }}</span>
            }
          </div>
          <p-button 
            icon="pi pi-shopping-cart" 
            [loading]="isAdding()"
            [disabled]="isAdding()"
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
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }
    .quick-overlay {
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .product-card:hover .quick-overlay {
      opacity: 1;
    }
    .wishlist-btn {
      transition: all 0.2s ease;
      border: none !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .wishlist-btn:hover {
      transform: scale(1.1);
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
  `]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  readonly isAdding = signal(false);
  readonly isWishlisted = signal(false);

  navigateToProduct() {
    this.router.navigate(['/products', this.product().id]);
  }

  toggleWishlist() {
    this.isWishlisted.update(v => !v);
  }

  async addToCart() {
    this.isAdding.set(true);
    await this.cartStore.addItem(this.product(), 1);
    this.isAdding.set(false);
  }
}
