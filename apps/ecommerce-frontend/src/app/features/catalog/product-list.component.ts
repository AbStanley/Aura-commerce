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
    <div class="space-y-8">
      <!-- Hero Section -->
      <div class="text-center space-y-4 py-8">
        <h1 class="text-4xl md:text-5xl font-bold gradient-text">
          Discover Amazing Products
        </h1>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our curated collection of high-quality products. 
          From everyday essentials to premium finds.
        </p>
      </div>

      <!-- Products Grid -->
      @if (products()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (product of products(); track product.id; let i = $index) {
            <div class="animate-fade-in" [style.animation-delay]="(i * 0.05) + 's'">
              <app-product-card 
                [product]="product" 
                (addToCart)="onAddToCart($event)" 
              />
            </div>
          }
        </div>
      } @else {
        <!-- Loading Skeletons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
            <div class="card overflow-hidden">
              <div class="aspect-square skeleton"></div>
              <div class="p-4 space-y-3">
                <div class="h-5 skeleton rounded w-3/4"></div>
                <div class="h-4 skeleton rounded w-full"></div>
                <div class="h-4 skeleton rounded w-2/3"></div>
                <div class="flex justify-between items-center pt-2">
                  <div class="h-6 skeleton rounded w-20"></div>
                  <div class="h-9 skeleton rounded w-24"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (products() && products()!.length === 0) {
        <div class="text-center py-16">
          <div class="text-6xl mb-4">🛒</div>
          <h3 class="text-xl font-semibold text-foreground mb-2">No products found</h3>
          <p class="text-muted-foreground">
            Check back later for new arrivals!
          </p>
        </div>
      }
    </div>
  `
})
export class ProductListComponent {
  private readonly catalogService = inject(CatalogService);
  private readonly cartStore = inject(CartStore);

  readonly products = this.catalogService.products;

  async onAddToCart(product: { id: string; name: string; price: number }) {
    await this.cartStore.addItem(product, 1);
  }
}
