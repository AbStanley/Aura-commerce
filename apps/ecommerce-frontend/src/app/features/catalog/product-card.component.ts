import { Component, input, signal, inject } from '@angular/core';
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
    <p-card [style]="{ cursor: 'pointer' }" (click)="navigateToProduct()">
      <!-- Image Section -->
      <ng-template pTemplate="header">
        <div class="relative overflow-hidden" style="height: 200px;">
          <div class="w-full h-full flex align-items-center justify-content-center surface-100">
            <i class="pi pi-box text-6xl text-300"></i>
          </div>
          
          <!-- Stock Badge -->
          @if (product().stockQuantity && product().stockQuantity < 10) {
            <p-tag severity="warn" value="Low Stock" 
                   class="absolute" style="top: 10px; left: 10px;"></p-tag>
          }
          
          <!-- Quick View Overlay -->
          <div class="quick-view-overlay absolute inset-0 flex align-items-center justify-content-center">
            <p-button icon="pi pi-eye" label="Quick View" 
                      [rounded]="true" size="small"
                      (click)="$event.stopPropagation(); navigateToProduct()"></p-button>
          </div>
        </div>
      </ng-template>

      <!-- Content -->
      <div class="flex flex-column gap-2">
        <span class="text-500 text-sm">{{ product().sku }}</span>
        <h3 class="text-lg font-semibold m-0 line-clamp-1">{{ product().name }}</h3>
        <p class="text-500 text-sm m-0 line-clamp-2">{{ product().description }}</p>
        
        <div class="flex align-items-center justify-content-between mt-2">
          <span class="text-2xl font-bold text-primary">{{ product().price | currency }}</span>
          <p-button 
            icon="pi pi-shopping-cart" 
            [loading]="isAdding()"
            [disabled]="isAdding()"
            (click)="$event.stopPropagation(); addToCart()"
            pTooltip="Add to cart"
            tooltipPosition="top"
            [rounded]="true"
            [outlined]="true">
          </p-button>
        </div>
      </div>
    </p-card>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .quick-view-overlay {
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    :host(:hover) .quick-view-overlay { opacity: 1; }
    .inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
  `]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  private readonly cartStore = inject(CartStore);

  readonly isAdding = signal(false);

  navigateToProduct() {
    window.location.href = `/products/${this.product().id}`;
  }

  async addToCart() {
    this.isAdding.set(true);
    await this.cartStore.addItem(this.product(), 1);
    this.isAdding.set(false);
  }
}
