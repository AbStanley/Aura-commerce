import { Component, input, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  template: `
    <div class="product-card surface-card border-round-lg overflow-hidden shadow-1 h-full 
                transition-all transition-duration-200 hover:shadow-4 cursor-pointer"
         (click)="navigateToProduct()">
      <!-- Image Section -->
      <div class="product-image relative overflow-hidden" style="height: 200px;">
        <div class="w-full h-full flex align-items-center justify-content-center surface-100">
          <i class="pi pi-box text-6xl text-300"></i>
        </div>
        
        <!-- Stock Badge -->
        @if (product().stockQuantity && product().stockQuantity < 10) {
          <p-tag severity="warn" value="Low Stock" 
                 styleClass="absolute" style="top: 12px; left: 12px;"></p-tag>
        }
        
        <!-- Quick View Overlay -->
        <div class="quick-overlay absolute top-0 left-0 right-0 bottom-0 
                    flex align-items-center justify-content-center">
          <p-button icon="pi pi-eye" label="Quick View" 
                    [rounded]="true" size="small"
                    (click)="$event.stopPropagation(); navigateToProduct()"></p-button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-3">
        <span class="text-500 text-sm block mb-1">{{ product().sku }}</span>
        <h3 class="text-lg font-semibold m-0 mb-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {{ product().name }}
        </h3>
        <p class="text-500 text-sm m-0 mb-3 line-height-3 overflow-hidden" style="max-height: 2.5rem;">
          {{ product().description }}
        </p>
        
        <div class="flex align-items-center justify-content-between">
          <span class="text-2xl font-bold text-primary">{{ product().price | currency }}</span>
          <p-button 
            icon="pi pi-shopping-cart" 
            [loading]="isAdding()"
            [disabled]="isAdding()"
            (onClick)="$event.stopPropagation(); addToCart()"
            pTooltip="Add to cart"
            tooltipPosition="top"
            [rounded]="true"
            severity="secondary">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
    }
    .quick-overlay {
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .product-card:hover .quick-overlay {
      opacity: 1;
    }
  `]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  readonly isAdding = signal(false);

  navigateToProduct() {
    this.router.navigate(['/products', this.product().id]);
  }

  async addToCart() {
    this.isAdding.set(true);
    await this.cartStore.addItem(this.product(), 1);
    this.isAdding.set(false);
  }
}
