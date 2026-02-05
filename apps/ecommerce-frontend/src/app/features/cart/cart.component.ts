import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from './cart.store';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DividerModule,
    SkeletonModule,
    TooltipModule
  ],
  template: `
    <div class="grid">
      <!-- Cart Items -->
      <div class="col-12 lg:col-8">
        <div class="flex align-items-center justify-content-between mb-4">
          <h1 class="text-2xl font-bold text-900 m-0">Shopping Cart</h1>
          @if (store.itemCount() > 0) {
            <p-button label="Clear All" icon="pi pi-trash" 
                      severity="danger" [text]="true" size="small"
                      (onClick)="clearCart()"></p-button>
          }
        </div>

        @if (store.isLoading()) {
          <!-- Loading Skeleton -->
          @for (i of [1, 2, 3]; track i) {
            <div class="surface-card border-round-lg p-4 mb-3 shadow-1">
              <div class="flex gap-4 align-items-center">
                <p-skeleton width="80px" height="80px" styleClass="border-round"></p-skeleton>
                <div class="flex-1">
                  <p-skeleton width="50%" height="1.5rem" styleClass="mb-2"></p-skeleton>
                  <p-skeleton width="25%" height="1rem"></p-skeleton>
                </div>
                <p-skeleton width="120px" height="2.5rem"></p-skeleton>
                <p-skeleton width="80px" height="1.5rem"></p-skeleton>
              </div>
            </div>
          }
        } @else if (store.cart() && store.itemCount() > 0) {
          @for (item of store.cart()?.items; track item.productId) {
            <div class="surface-card border-round-lg p-4 mb-3 shadow-1">
              <div class="flex flex-column md:flex-row gap-4 align-items-center">
                <!-- Product Image -->
                <div class="surface-100 border-round-lg flex align-items-center justify-content-center flex-shrink-0"
                     style="width: 80px; height: 80px;">
                  <i class="pi pi-box text-3xl text-400"></i>
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 text-center md:text-left">
                  <h3 class="text-lg font-semibold text-900 m-0 mb-1">{{ item.productName }}</h3>
                  <span class="text-500">{{ item.unitPrice | currency }} each</span>
                </div>
                
                <!-- Quantity Controls -->
                <div class="flex align-items-center gap-3">
                  <p-inputNumber [(ngModel)]="item.quantity" 
                                 [showButtons]="true" 
                                 buttonLayout="horizontal"
                                 [min]="1" [max]="99"
                                 (onInput)="updateQuantity(item.productId, $event.value ?? 1)"
                                 decrementButtonClass="p-button-secondary p-button-outlined"
                                 incrementButtonClass="p-button-secondary p-button-outlined"
                                 inputStyleClass="w-3rem text-center">
                  </p-inputNumber>
                </div>
                
                <!-- Price & Remove -->
                <div class="flex align-items-center gap-3">
                  <span class="text-xl font-bold text-primary">{{ item.totalPrice | currency }}</span>
                  <p-button icon="pi pi-times" [rounded]="true" [text]="true" 
                            severity="danger" size="small"
                            (onClick)="removeItem(item.productId)"
                            pTooltip="Remove"></p-button>
                </div>
              </div>
            </div>
          }
        } @else {
          <!-- Empty State -->
          <div class="surface-card border-round-lg p-6 shadow-1 text-center">
            <i class="pi pi-shopping-cart text-6xl text-300 mb-4 block"></i>
            <h3 class="text-xl font-semibold text-900 mb-2">Your cart is empty</h3>
            <p class="text-500 mb-4 line-height-3">Looks like you haven't added anything yet.</p>
            <a routerLink="/" pButton label="Start Shopping" icon="pi pi-arrow-right" 
               iconPos="right"></a>
          </div>
        }
      </div>

      <!-- Order Summary -->
      <div class="col-12 lg:col-4">
        @if (store.itemCount() > 0) {
          <div class="surface-card border-round-lg p-4 shadow-2 sticky" style="top: 80px;">
            <h3 class="text-xl font-semibold text-900 m-0 mb-4">Order Summary</h3>
            
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span class="text-500">Subtotal ({{ store.itemCount() }} items)</span>
                <span class="font-medium text-900">{{ store.totalPrice() | currency }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-500">Shipping</span>
                <span class="font-medium text-green-500">Free</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-500">Tax</span>
                <span class="font-medium text-500">Calculated at checkout</span>
              </div>
              
              <p-divider></p-divider>
              
              <div class="flex justify-content-between align-items-center">
                <span class="text-lg font-semibold text-900">Total</span>
                <span class="text-2xl font-bold text-primary">{{ store.totalPrice() | currency }}</span>
              </div>
              
              <a routerLink="/checkout" pButton label="Proceed to Checkout" 
                 icon="pi pi-arrow-right" iconPos="right"
                 styleClass="w-full mt-2"></a>
              
              <a routerLink="/" pButton label="Continue Shopping" 
                 [outlined]="true" styleClass="w-full" severity="secondary"></a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sticky { position: sticky; }
  `]
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
