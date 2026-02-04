import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from './cart.store';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-900">Shopping Cart</h2>
      </div>

      @if (store.isLoading()) {
        <div class="p-8 text-center text-gray-500">
             Loading cart...
        </div>
      } @else if (store.cart() && store.itemCount() > 0) {
        <div class="divide-y divide-gray-200">
          @for (item of store.cart()?.items; track item.productId) {
            <div class="p-6 flex items-center gap-6">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ item.productName }}</h3>
                <p class="text-sm text-gray-500">Unit Price: \${{ item.unitPrice }}</p>
              </div>

              <div class="flex items-center gap-4">
                 <button (click)="updateQuantity(item.productId, item.quantity - 1)" 
                    class="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                    -
                 </button>
                 <span class="font-medium w-8 text-center">{{ item.quantity }}</span>
                 <button (click)="updateQuantity(item.productId, item.quantity + 1)"
                    class="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                    +
                 </button>
              </div>

              <div class="text-right w-24">
                <p class="font-bold text-gray-900">\${{ item.totalPrice }}</p>
                <button (click)="removeItem(item.productId)" class="text-sm text-red-600 hover:text-red-800 mt-1">
                  Remove
                </button>
              </div>
            </div>
          }
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div>
                <button (click)="clearCart()" class="text-sm text-gray-600 hover:text-red-600">Clear Cart</button>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <p class="text-sm text-gray-500">Subtotal</p>
                    <p class="text-2xl font-bold text-gray-900">\${{ store.totalPrice() }}</p>
                </div>
                <a routerLink="/checkout" class="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Proceed to Checkout
                </a>
            </div>
        </div>
      } @else {
        <div class="p-12 text-center">
            <p class="text-gray-500 mb-4">Your cart is empty.</p>
            <a routerLink="/products" class="text-blue-600 font-medium hover:underline">Start Shopping</a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
    readonly store = inject(CartStore);

    constructor() {
        // Ensure latest cart data is loaded
        this.store.loadCart().subscribe();
    }

    updateQuantity(productId: string, quantity: number) {
        this.store.updateQuantity(productId, quantity).subscribe();
    }

    removeItem(productId: string) {
        this.store.removeItem(productId).subscribe();
    }

    clearCart() {
        this.store.clearCart().subscribe();
    }
}
