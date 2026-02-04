import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from './cart.store';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <p class="text-muted-foreground text-sm">
            @if (store.itemCount() > 0) {
              {{ store.itemCount() }} item{{ store.itemCount() > 1 ? 's' : '' }} in your cart
            } @else {
              Your cart is empty
            }
          </p>
        </div>
        @if (store.itemCount() > 0) {
          <button 
            (click)="clearCart()" 
            class="btn btn-ghost btn-sm text-destructive hover:bg-destructive/10">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Clear Cart
          </button>
        }
      </div>

      @if (store.isLoading()) {
        <!-- Loading Skeleton -->
        <div class="card">
          @for (i of [1, 2, 3]; track i) {
            <div class="p-6 flex items-center gap-6 border-b border-border last:border-0">
              <div class="w-20 h-20 skeleton rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-5 skeleton rounded w-1/3"></div>
                <div class="h-4 skeleton rounded w-1/4"></div>
              </div>
              <div class="h-10 skeleton rounded w-28"></div>
              <div class="h-6 skeleton rounded w-20"></div>
            </div>
          }
        </div>
      } @else if (store.cart() && store.itemCount() > 0) {
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Cart Items -->
          <div class="lg:col-span-2 card divide-y divide-border">
            @for (item of store.cart()?.items; track item.productId) {
              <div class="p-6 flex items-center gap-4 group animate-fade-in">
                <!-- Product Image -->
                <div class="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span class="text-3xl">📦</span>
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-foreground truncate">{{ item.productName }}</h3>
                  <p class="text-sm text-muted-foreground">
                    Unit price: {{ item.unitPrice | currency }}
                  </p>
                </div>
                
                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                  <button 
                    (click)="updateQuantity(item.productId, item.quantity - 1)"
                    class="btn btn-outline btn-icon h-8 w-8"
                    [disabled]="item.quantity <= 1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <span class="w-10 text-center font-medium">{{ item.quantity }}</span>
                  <button 
                    (click)="updateQuantity(item.productId, item.quantity + 1)"
                    class="btn btn-outline btn-icon h-8 w-8">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Price & Remove -->
                <div class="text-right">
                  <p class="font-bold text-foreground">{{ item.totalPrice | currency }}</p>
                  <button 
                    (click)="removeItem(item.productId)" 
                    class="text-sm text-destructive hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Remove
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24 space-y-4">
              <h2 class="font-semibold text-foreground">Order Summary</h2>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span class="font-medium">{{ store.totalPrice() | currency }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Shipping</span>
                  <span class="font-medium text-green-600">Free</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Tax</span>
                  <span class="font-medium">Calculated at checkout</span>
                </div>
              </div>
              
              <div class="border-t border-border pt-4">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-foreground">Total</span>
                  <span class="text-2xl font-bold text-primary">{{ store.totalPrice() | currency }}</span>
                </div>
              </div>
              
              <a routerLink="/checkout" 
                 class="btn btn-primary btn-lg w-full">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
                Proceed to Checkout
              </a>
              
              <a routerLink="/" 
                 class="btn btn-ghost btn-md w-full text-muted-foreground">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="card p-12 text-center">
          <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
          <p class="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <a routerLink="/" class="btn btn-primary btn-md">
            Start Shopping
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  readonly store = inject(CartStore);

  constructor() {
    this.store.loadCart();
  }

  updateQuantity(productId: string, quantity: number) {
    this.store.updateQuantity(productId, quantity);
  }

  removeItem(productId: string) {
    this.store.removeItem(productId);
  }

  clearCart() {
    this.store.clearCart();
  }
}
