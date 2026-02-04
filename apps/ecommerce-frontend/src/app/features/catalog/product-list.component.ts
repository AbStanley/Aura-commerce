import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from './catalog.service';
import { ProductCardComponent } from './product-card.component';
import { CartStore } from '../cart/cart.store';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">Latest Products</h2>
      </div>

      <!-- Simplified Data View -->
      @if (products()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of products(); track product.id) {
            <app-product-card 
              [product]="product" 
              (addToCart)="onAddToCart($event)" 
            />
          }
        </div>
      } @else {
        <!-- Optional Loading Placeholder if signal is initially null -->
        <div class="p-4 text-gray-500">Loading products...</div>
      }
    </div>
  `
})
export class ProductListComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly cartStore = inject(CartStore);

  readonly products = this.catalogService.products;

  onAddToCart(product: { id: string; name: string; price: number }) {
    this.cartStore.addItem(product, 1).subscribe({
      next: () => console.log('Added to cart'),
      error: (err: any) => console.error('Failed to add to cart', err)
    });
  }
}
