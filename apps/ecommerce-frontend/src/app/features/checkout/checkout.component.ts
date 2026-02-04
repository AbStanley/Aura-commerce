import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../cart/cart.store';
import { CheckoutService } from './checkout.service';

@Component({
   selector: 'app-checkout',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule],
   template: `
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-foreground">Checkout</h1>
        <p class="text-muted-foreground">Complete your order</p>
      </div>

      <!-- Progress Steps -->
      <div class="flex justify-center">
        <div class="flex items-center gap-4">
          @for (step of steps; track step.id; let i = $index) {
            <div class="flex items-center gap-2">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                [class]="currentStep() >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'">
                @if (currentStep() > step.id) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  {{ step.id }}
                }
              </div>
              <span 
                class="text-sm font-medium hidden sm:block"
                [class]="currentStep() >= step.id ? 'text-foreground' : 'text-muted-foreground'">
                {{ step.label }}
              </span>
            </div>
            @if (i < steps.length - 1) {
              <div 
                class="w-12 h-0.5 transition-colors"
                [class]="currentStep() > step.id ? 'bg-primary' : 'bg-muted'">
              </div>
            }
          }
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Form Section -->
        <div class="lg:col-span-2">
          <div class="card p-6 animate-fade-in">
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" class="space-y-6">
              
              <!-- Step 1: Shipping Information -->
              @if (currentStep() === 1) {
                <div class="space-y-4">
                  <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Shipping Address
                  </h2>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">Street Address</label>
                    <input formControlName="street" type="text" class="input" placeholder="123 Main St">
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-foreground">City</label>
                      <input formControlName="city" type="text" class="input" placeholder="New York">
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-foreground">State</label>
                      <input formControlName="state" type="text" class="input" placeholder="NY">
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-foreground">ZIP Code</label>
                      <input formControlName="zipCode" type="text" class="input" placeholder="10001">
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-foreground">Country</label>
                      <input formControlName="country" type="text" class="input" placeholder="USA">
                    </div>
                  </div>
                </div>
              }

              <!-- Step 2: Payment (placeholder) -->
              @if (currentStep() === 2) {
                <div class="space-y-4">
                  <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    Payment Method
                  </h2>
                  
                  <div class="p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <div class="flex items-center gap-3">
                      <input type="radio" checked class="text-primary">
                      <div>
                        <p class="font-medium text-foreground">Demo Payment</p>
                        <p class="text-sm text-muted-foreground">No actual payment required</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="p-4 rounded-lg border border-border bg-muted/50 opacity-50">
                    <div class="flex items-center gap-3">
                      <input type="radio" disabled>
                      <div>
                        <p class="font-medium text-foreground">Credit Card</p>
                        <p class="text-sm text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Error Message -->
              @if (checkoutService.error()) {
                <div class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ checkoutService.error() }}
                </div>
              }

              <!-- Navigation Buttons -->
              <div class="flex gap-3 pt-4 border-t border-border">
                @if (currentStep() > 1) {
                  <button 
                    type="button" 
                    (click)="prevStep()" 
                    class="btn btn-outline btn-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                }
                
                @if (currentStep() < steps.length) {
                  <button 
                    type="button" 
                    (click)="nextStep()" 
                    [disabled]="!isCurrentStepValid()"
                    class="btn btn-primary btn-md ml-auto">
                    Continue
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                } @else {
                  <button 
                    type="submit" 
                    [disabled]="checkoutForm.invalid || checkoutService.isProcessing()"
                    class="btn btn-primary btn-lg ml-auto">
                    @if (checkoutService.isProcessing()) {
                      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M5 13l4 4L19 7"/>
                      </svg>
                      Place Order
                    }
                  </button>
                }
              </div>
            </form>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="card p-6 space-y-4 sticky top-24">
            <h2 class="font-semibold text-foreground">Order Summary</h2>
            
            <div class="space-y-3 max-h-64 overflow-y-auto">
              @for (item of cartStore.cart()?.items; track item.productId) {
                <div class="flex gap-3">
                  <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span class="text-xl">📦</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ item.productName }}</p>
                    <p class="text-xs text-muted-foreground">Qty: {{ item.quantity }}</p>
                  </div>
                  <p class="text-sm font-medium text-foreground">{{ item.totalPrice | currency }}</p>
                </div>
              }
            </div>
            
            <div class="border-t border-border pt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Subtotal</span>
                <span class="font-medium">{{ cartStore.totalPrice() | currency }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Shipping</span>
                <span class="font-medium text-green-600">Free</span>
              </div>
              <div class="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span class="text-primary">{{ cartStore.totalPrice() | currency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent {
   readonly cartStore = inject(CartStore);
   readonly checkoutService = inject(CheckoutService);
   private readonly fb = inject(FormBuilder);

   readonly currentStep = signal(1);

   readonly steps = [
      { id: 1, label: 'Shipping' },
      { id: 2, label: 'Payment' }
   ];

   readonly checkoutForm = this.fb.group({
      street: ['123 Main St', Validators.required],
      city: ['Tech City', Validators.required],
      state: ['TC', Validators.required],
      zipCode: ['10101', Validators.required],
      country: ['DevLand', Validators.required]
   });

   nextStep() {
      if (this.currentStep() < this.steps.length) {
         this.currentStep.update(s => s + 1);
      }
   }

   prevStep() {
      if (this.currentStep() > 1) {
         this.currentStep.update(s => s - 1);
      }
   }

   isCurrentStepValid(): boolean {
      if (this.currentStep() === 1) {
         const { street, city, state, zipCode, country } = this.checkoutForm.controls;
         return street.valid && city.valid && state.valid && zipCode.valid && country.valid;
      }
      return true;
   }

   onSubmit() {
      if (this.checkoutForm.invalid) return;

      const shipping = this.checkoutForm.getRawValue();
      this.checkoutService.processCheckout({
         street: shipping.street!,
         city: shipping.city!,
         state: shipping.state!,
         postalCode: shipping.zipCode!,
         country: shipping.country!
      });
   }
}
