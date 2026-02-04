import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Breadcrumb -->
    <nav class="mb-6">
      <ol class="flex items-center gap-2 text-sm text-muted-foreground">
        <li><a routerLink="/" class="hover:text-foreground transition-colors">Home</a></li>
        <li><span class="text-muted-foreground/50">/</span></li>
        <li><a routerLink="/products" class="hover:text-foreground transition-colors">Products</a></li>
        <li><span class="text-muted-foreground/50">/</span></li>
        <li class="text-foreground font-medium truncate">{{ product()?.name || 'Loading...' }}</li>
      </ol>
    </nav>

    @if (loading()) {
      <!-- Loading Skeleton -->
      <div class="grid lg:grid-cols-2 gap-12">
        <div class="aspect-square skeleton rounded-xl"></div>
        <div class="space-y-6">
          <div class="h-8 skeleton rounded w-3/4"></div>
          <div class="h-10 skeleton rounded w-1/3"></div>
          <div class="space-y-2">
            <div class="h-4 skeleton rounded w-full"></div>
            <div class="h-4 skeleton rounded w-full"></div>
            <div class="h-4 skeleton rounded w-2/3"></div>
          </div>
          <div class="h-14 skeleton rounded w-full"></div>
        </div>
      </div>
    } @else if (product()) {
      <div class="grid lg:grid-cols-2 gap-12 animate-fade-in">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden group">
            <div class="text-9xl group-hover:scale-110 transition-transform duration-500">📦</div>
          </div>
          <!-- Thumbnail placeholder -->
          <div class="grid grid-cols-4 gap-2">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="aspect-square bg-muted rounded-lg flex items-center justify-center cursor-pointer 
                          hover:ring-2 ring-primary transition-all"
                   [class.ring-2]="i === 1">
                <span class="text-2xl">📦</span>
              </div>
            }
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <!-- Header -->
          <div>
            <span class="badge badge-secondary mb-2">{{ product()?.sku }}</span>
            <h1 class="text-3xl font-bold text-foreground">{{ product()?.name }}</h1>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-4">
            <span class="text-4xl font-bold text-primary">{{ product()?.price | currency }}</span>
            <span class="text-lg text-muted-foreground line-through">{{ (product()?.price ?? 0) * 1.2 | currency }}</span>
            <span class="badge badge-success">20% OFF</span>
          </div>

          <!-- Stock Status -->
          <div class="flex items-center gap-2">
            @if ((product()?.stockQuantity ?? 0) > 10) {
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              <span class="text-sm text-green-600 dark:text-green-400">In Stock</span>
            } @else if ((product()?.stockQuantity ?? 0) > 0) {
              <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span class="text-sm text-yellow-600 dark:text-yellow-400">Low Stock - Only {{ product()?.stockQuantity }} left</span>
            } @else {
              <span class="w-2 h-2 bg-red-500 rounded-full"></span>
              <span class="text-sm text-destructive">Out of Stock</span>
            }
          </div>

          <!-- Description -->
          <div class="prose prose-sm dark:prose-invert">
            <p class="text-muted-foreground leading-relaxed">{{ product()?.description }}</p>
          </div>

          <!-- Quantity & Add to Cart -->
          <div class="flex gap-4">
            <div class="flex items-center border border-input rounded-lg">
              <button 
                (click)="decreaseQty()" 
                [disabled]="quantity <= 1"
                class="btn btn-ghost btn-icon h-12 rounded-r-none disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <span class="w-12 text-center font-medium">{{ quantity }}</span>
              <button 
                (click)="increaseQty()" 
                class="btn btn-ghost btn-icon h-12 rounded-l-none">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>

            <button 
              (click)="addToCart()"
              [disabled]="isAdding()"
              class="btn btn-primary btn-lg flex-1">
              @if (isAdding()) {
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Adding...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Add to Cart
              }
            </button>
          </div>

          <!-- Success Message -->
          @if (addedMessage()) {
            <div class="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 animate-fade-in">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="font-medium">Added {{ quantity }} item(s) to your cart!</span>
              <a routerLink="/cart" class="ml-auto text-sm underline hover:no-underline">View Cart</a>
            </div>
          }

          <!-- Features -->
          <div class="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Free Shipping</p>
                <p class="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Money Back</p>
                <p class="text-xs text-muted-foreground">30-day guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <!-- Not Found -->
      <div class="card p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Product not found</h3>
        <p class="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <a routerLink="/" class="btn btn-primary btn-md">
          Back to Products
        </a>
      </div>
    }
  `
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly cartStore = inject(CartStore);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly addedMessage = signal(false);
  readonly isAdding = signal(false);

  quantity = 1;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.catalogService.getProduct(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

  async addToCart() {
    const p = this.product();
    if (!p) return;

    this.isAdding.set(true);
    await this.cartStore.addItem(p, this.quantity);
    this.isAdding.set(false);
    this.addedMessage.set(true);
    setTimeout(() => this.addedMessage.set(false), 3000);
  }
}
