import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartStore } from '../cart/cart.store';
import { AuthStore } from '../auth/auth.store';
import { OrderService, PlaceOrderCommand } from '../orders/order.service';
import { switchMap } from 'rxjs';

@Component({
   selector: 'app-checkout',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   template: `
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Shipping Form -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
        
        <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Street Address</label>
            <input formControlName="street" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700">City</label>
                <input formControlName="city" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">State</label>
                <input formControlName="state" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
             </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-sm font-medium text-gray-700">Zip Code</label>
                <input formControlName="zipCode" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700">Country</label>
                <input formControlName="country" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
             </div>
          </div>

          <button 
             type="submit" 
             [disabled]="checkoutForm.invalid || isProcessing()"
             class="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors">
             @if (isProcessing()) {
                Processing Order...
             } @else {
                Place Order
             }
          </button>
           @if (error()) {
            <p class="text-red-600 text-sm mt-2">{{ error() }}</p>
           }
        </form>
      </div>

      <!-- Order Summary -->
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
        
        <div class="divide-y divide-gray-200 mb-4">
           @for (item of cartStore.cart()?.items; track item.productId) {
              <div class="py-2 flex justify-between text-sm">
                 <span>{{ item.productName }} (x{{ item.quantity }})</span>
                 <span class="font-medium">\${{ item.totalPrice }}</span>
              </div>
           }
        </div>

        <div class="border-t border-gray-200 pt-4 flex justify-between items-center">
           <span class="text-lg font-bold text-gray-900">Total</span>
           <span class="text-2xl font-bold text-blue-600">\${{ cartStore.totalPrice() }}</span>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
   readonly cartStore = inject(CartStore);
   readonly authStore = inject(AuthStore);
   private readonly orderService = inject(OrderService);
   private readonly router = inject(Router);
   private readonly fb = inject(FormBuilder);

   readonly isProcessing = signal(false);
   readonly error = signal<string | null>(null);

   readonly checkoutForm = this.fb.group({
      street: ['123 Main St', Validators.required],
      city: ['Tech City', Validators.required],
      state: ['TC', Validators.required],
      zipCode: ['10101', Validators.required],
      country: ['DevLand', Validators.required]
   });

   onSubmit() {
      if (this.checkoutForm.invalid) return;

      const userId = this.authStore.userId();
      const cart = this.cartStore.cart();

      if (!userId || !cart) {
         this.error.set('Cart is empty or user not logged in');
         return;
      }

      this.isProcessing.set(true);
      const shipping = this.checkoutForm.getRawValue();

      const command: PlaceOrderCommand = {
         userId,
         items: cart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            productName: i.productName || 'Unknown Product',
            unitPrice: i.unitPrice || 0
         })),
         shippingAddress: {
            street: shipping.street!,
            city: shipping.city!,
            state: shipping.state!,
            postalCode: shipping.zipCode!,
            country: shipping.country!
         }
      };

      // 1. Place Order
      this.orderService.placeOrder(command).pipe(
         // 2. Process Payment (Mock)
         switchMap(orderRes => {
            return this.orderService.processPayment({
               orderId: orderRes.orderId,
               userId: userId,
               amount: cart.totalAmount,
               currency: 'USD',
               paymentMethodId: 'pm_card_visa'
            });
         })
      ).subscribe({
         next: () => {
            this.cartStore.clearCart().subscribe();
            this.isProcessing.set(false);
            this.router.navigate(['/profile']);
         },
         error: (err) => {
            console.error(err);
            this.isProcessing.set(false);
            this.error.set('Failed to place order. Please try again.');
         }
      });
   }
}
