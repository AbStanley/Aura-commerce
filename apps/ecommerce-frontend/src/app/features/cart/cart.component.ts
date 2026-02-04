import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartStore } from './cart.store';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';

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
    SkeletonModule
  ],
  template: `
    <div class="grid">
      <!-- Cart Items -->
      <div class="col-12 lg:col-8">
        <div class="flex align-items-center justify-content-between mb-4">
          <h1 class="text-2xl font-bold m-0">Shopping Cart</h1>
          @if (store.itemCount() > 0) {
            <p-button label="Clear Cart" icon="pi pi-trash" 
                      severity="danger" [text]="true" size="small"
                      (click)="clearCart()"></p-button>
          }
        </div>

        @if (store.isLoading()) {
          <!-- Loading Skeleton -->
          @for (i of [1, 2, 3]; track i) {
            <p-card styleClass="mb-3">
              <div class="flex gap-4">
                <p-skeleton width="80px" height="80px"></p-skeleton>
                <div class="flex-1">
                  <p-skeleton width="40%" height="1.5rem" styleClass="mb-2"></p-skeleton>
                  <p-skeleton width="20%" height="1rem"></p-skeleton>
                </div>
                <p-skeleton width="100px" height="2.5rem"></p-skeleton>
              </div>
            </p-card>
          }
        } @else if (store.cart() && store.itemCount() > 0) {
          @for (item of store.cart()?.items; track item.productId) {
            <p-card styleClass="mb-3">
              <div class="flex align-items-center gap-4">
                <!-- Product Image -->
                <div class="surface-100 border-round flex align-items-center justify-content-center"
                     style="width: 80px; height: 80px;">
                  <i class="pi pi-box text-3xl text-400"></i>
                </div>
                
                <!-- Product Info -->
                <div class="flex-1">
                  <h3 class="text-lg font-semibold m-0">{{ item.productName }}</h3>
                  <span class="text-500">{{ item.unitPrice | currency }} each</span>
                </div>
                
                <!-- Quantity Controls -->
                <p-inputNumber [(ngModel)]="item.quantity" 
                               [showButtons]="true" 
                               buttonLayout="horizontal"
                               [min]="1" [max]="99"
                               (onInput)="updateQuantity(item.productId, $event.value ?? 1)"
                               decrementButtonClass="p-button-outlined"
                               incrementButtonClass="p-button-outlined"
                               inputStyleClass="w-3rem text-center">
                </p-inputNumber>
                
                <!-- Price & Remove -->
                <div class="text-right">
                  <div class="text-xl font-bold text-primary">{{ item.totalPrice | currency }}</div>
                  <p-button icon="pi pi-times" [rounded]="true" [text]="true" 
                            severity="danger" size="small"
                            (click)="removeItem(item.productId)"></p-button>
                </div>
              </div>
            </p-card>
          }
        } @else {
          <!-- Empty State -->
          <p-card>
            <div class="text-center py-6">
              <i class="pi pi-shopping-cart text-6xl text-300 mb-4"></i>
              <h3 class="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p class="text-500 mb-4">Looks like you haven't added anything yet.</p>
              <a routerLink="/" pButton label="Start Shopping" icon="pi pi-arrow-right"></a>
            </div>
          </p-card>
        }
      </div>

      <!-- Order Summary -->
      <div class="col-12 lg:col-4">
        @if (store.itemCount() > 0) {
          <p-card header="Order Summary">
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span class="text-500">Subtotal</span>
                <span class="font-medium">{{ store.totalPrice() | currency }}</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-500">Shipping</span>
                <span class="font-medium text-green-500">Free</span>
              </div>
              <div class="flex justify-content-between">
                <span class="text-500">Tax</span>
                <span class="font-medium">Calculated at checkout</span>
              </div>
              
              <p-divider></p-divider>
              
              <div class="flex justify-content-between">
                <span class="text-lg font-semibold">Total</span>
                <span class="text-2xl font-bold text-primary">{{ store.totalPrice() | currency }}</span>
              </div>
              
              <a routerLink="/checkout" pButton label="Proceed to Checkout" 
                 icon="pi pi-arrow-right" iconPos="right"
                 styleClass="w-full mt-2"></a>
              
              <a routerLink="/" pButton label="Continue Shopping" 
                 [outlined]="true" styleClass="w-full"></a>
            </div>
          </p-card>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
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
