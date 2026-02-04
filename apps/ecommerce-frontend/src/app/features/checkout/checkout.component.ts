import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../cart/cart.store';
import { CheckoutService } from './checkout.service';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DividerModule,
    MessageModule,
    RadioButtonModule,
    StepsModule
  ],
  template: `
    <div class="grid">
      <!-- Checkout Form -->
      <div class="col-12 lg:col-8">
        <h1 class="text-2xl font-bold text-900 mb-4">Checkout</h1>
        
        <!-- Steps Indicator -->
        <p-steps [model]="steps" [activeIndex]="currentStep()" [readonly]="true"
                 styleClass="mb-5"></p-steps>

        <!-- Step 1: Shipping -->
        @if (currentStep() === 0) {
          <div class="surface-card border-round-lg p-4 shadow-1">
            <h3 class="text-lg font-semibold text-900 m-0 mb-4">
              <i class="pi pi-map-marker mr-2 text-primary"></i>
              Shipping Address
            </h3>
            
            <form [formGroup]="checkoutForm" class="flex flex-column gap-4">
              <div class="flex flex-column gap-2">
                <label class="font-medium text-900">Street Address</label>
                <input pInputText formControlName="street" placeholder="123 Main St" class="w-full" />
              </div>
              
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium text-900">City</label>
                    <input pInputText formControlName="city" placeholder="New York" class="w-full" />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium text-900">State</label>
                    <input pInputText formControlName="state" placeholder="NY" class="w-full" />
                  </div>
                </div>
              </div>
              
              <div class="grid">
                <div class="col-12 md:col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium text-900">ZIP Code</label>
                    <input pInputText formControlName="zipCode" placeholder="10001" class="w-full" />
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium text-900">Country</label>
                    <input pInputText formControlName="country" placeholder="USA" class="w-full" />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-content-end pt-3">
                <p-button label="Continue to Payment" icon="pi pi-arrow-right" iconPos="right"
                          (onClick)="currentStep.set(1)"
                          [disabled]="!isShippingValid()"></p-button>
              </div>
            </form>
          </div>
        }

        <!-- Step 2: Payment -->
        @if (currentStep() === 1) {
          <div class="surface-card border-round-lg p-4 shadow-1">
            <h3 class="text-lg font-semibold text-900 m-0 mb-4">
              <i class="pi pi-credit-card mr-2 text-primary"></i>
              Payment Method
            </h3>
            
            <div class="flex flex-column gap-3">
              <div class="flex align-items-center gap-3 p-3 surface-50 border-round-lg border-1 border-primary cursor-pointer"
                   (click)="paymentMethod = 'demo'">
                <p-radioButton name="payment" value="demo" [(ngModel)]="paymentMethod"></p-radioButton>
                <div class="flex-1">
                  <div class="font-semibold text-900">Demo Payment</div>
                  <div class="text-500 text-sm">No actual payment required</div>
                </div>
                <i class="pi pi-check-circle text-primary text-xl" 
                   [class.hidden]="paymentMethod !== 'demo'"></i>
              </div>
              
              <div class="flex align-items-center gap-3 p-3 surface-100 border-round-lg border-1 surface-border opacity-50">
                <p-radioButton name="payment" value="card" [disabled]="true"></p-radioButton>
                <div class="flex-1">
                  <div class="font-medium text-500">Credit Card</div>
                  <div class="text-400 text-sm">Coming soon</div>
                </div>
              </div>
            </div>

            @if (checkoutService.error()) {
              <p-message severity="error" [text]="checkoutService.error()!" styleClass="w-full mt-4"></p-message>
            }

            <div class="flex justify-content-between pt-4 mt-3">
              <p-button label="Back" icon="pi pi-arrow-left" [outlined]="true" severity="secondary"
                        (onClick)="currentStep.set(0)"></p-button>
              <p-button label="Place Order" icon="pi pi-check" 
                        [loading]="checkoutService.isProcessing()"
                        (onClick)="onSubmit()"
                        [disabled]="checkoutForm.invalid"></p-button>
            </div>
          </div>
        }
      </div>

      <!-- Order Summary -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round-lg p-4 shadow-2 sticky" style="top: 80px;">
          <h3 class="text-lg font-semibold text-900 m-0 mb-4">Order Summary</h3>
          
          <div class="flex flex-column gap-3 mb-4" style="max-height: 250px; overflow-y: auto;">
            @for (item of cartStore.cart()?.items; track item.productId) {
              <div class="flex gap-3 align-items-center">
                <div class="surface-100 border-round flex align-items-center justify-content-center flex-shrink-0"
                     style="width: 48px; height: 48px;">
                  <i class="pi pi-box text-lg text-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                    {{ item.productName }}
                  </div>
                  <div class="text-500 text-xs">Qty: {{ item.quantity }}</div>
                </div>
                <span class="font-medium text-900">{{ item.totalPrice | currency }}</span>
              </div>
            }
          </div>
          
          <p-divider></p-divider>
          
          <div class="flex flex-column gap-3">
            <div class="flex justify-content-between text-sm">
              <span class="text-500">Subtotal</span>
              <span class="font-medium text-900">{{ cartStore.totalPrice() | currency }}</span>
            </div>
            <div class="flex justify-content-between text-sm">
              <span class="text-500">Shipping</span>
              <span class="font-medium text-green-500">Free</span>
            </div>
            <p-divider styleClass="my-2"></p-divider>
            <div class="flex justify-content-between align-items-center">
              <span class="font-semibold text-900">Total</span>
              <span class="text-2xl font-bold text-primary">{{ cartStore.totalPrice() | currency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sticky { position: sticky; }
    .hidden { display: none; }
    .min-w-0 { min-width: 0; }
  `]
})
export class CheckoutComponent {
  readonly cartStore = inject(CartStore);
  readonly checkoutService = inject(CheckoutService);
  private readonly fb = inject(FormBuilder);

  readonly currentStep = signal(0);
  paymentMethod = 'demo';

  readonly steps: MenuItem[] = [
    { label: 'Shipping' },
    { label: 'Payment' }
  ];

  readonly checkoutForm = this.fb.group({
    street: ['123 Main St', Validators.required],
    city: ['Tech City', Validators.required],
    state: ['TC', Validators.required],
    zipCode: ['10101', Validators.required],
    country: ['DevLand', Validators.required]
  });

  isShippingValid(): boolean {
    const { street, city, state, zipCode, country } = this.checkoutForm.controls;
    return street.valid && city.valid && state.valid && zipCode.valid && country.valid;
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
