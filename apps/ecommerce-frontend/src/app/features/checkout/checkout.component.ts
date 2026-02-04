import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../cart/cart.store';
import { CheckoutService } from './checkout.service';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
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
        <h1 class="text-2xl font-bold mb-4">Checkout</h1>
        
        <!-- Steps Indicator -->
        <p-steps [model]="steps" [activeIndex]="currentStep()" [readonly]="false"
                 styleClass="mb-4"></p-steps>

        <!-- Step 1: Shipping -->
        @if (currentStep() === 0) {
          <p-card header="Shipping Address">
            <form [formGroup]="checkoutForm" class="flex flex-column gap-4">
              <div class="flex flex-column gap-2">
                <label class="font-medium">Street Address</label>
                <input pInputText formControlName="street" placeholder="123 Main St" class="w-full" />
              </div>
              
              <div class="grid">
                <div class="col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium">City</label>
                    <input pInputText formControlName="city" placeholder="New York" class="w-full" />
                  </div>
                </div>
                <div class="col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium">State</label>
                    <input pInputText formControlName="state" placeholder="NY" class="w-full" />
                  </div>
                </div>
              </div>
              
              <div class="grid">
                <div class="col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium">ZIP Code</label>
                    <input pInputText formControlName="zipCode" placeholder="10001" class="w-full" />
                  </div>
                </div>
                <div class="col-6">
                  <div class="flex flex-column gap-2">
                    <label class="font-medium">Country</label>
                    <input pInputText formControlName="country" placeholder="USA" class="w-full" />
                  </div>
                </div>
              </div>
              
              <div class="flex justify-content-end">
                <p-button label="Continue to Payment" icon="pi pi-arrow-right" iconPos="right"
                          (onClick)="currentStep.set(1)"
                          [disabled]="!isShippingValid()"></p-button>
              </div>
            </form>
          </p-card>
        }

        <!-- Step 2: Payment -->
        @if (currentStep() === 1) {
          <p-card header="Payment Method">
            <div class="flex flex-column gap-3">
              <div class="flex align-items-center gap-3 p-3 surface-50 border-round border-1 border-primary">
                <p-radioButton name="payment" value="demo" [(ngModel)]="paymentMethod"></p-radioButton>
                <div>
                  <div class="font-medium">Demo Payment</div>
                  <div class="text-500 text-sm">No actual payment required</div>
                </div>
              </div>
              
              <div class="flex align-items-center gap-3 p-3 surface-100 border-round opacity-50">
                <p-radioButton name="payment" value="card" [disabled]="true"></p-radioButton>
                <div>
                  <div class="font-medium">Credit Card</div>
                  <div class="text-500 text-sm">Coming soon</div>
                </div>
              </div>
            </div>

            @if (checkoutService.error()) {
              <p-message severity="error" [text]="checkoutService.error()!" styleClass="w-full mt-3"></p-message>
            }

            <div class="flex justify-content-between mt-4">
              <p-button label="Back" icon="pi pi-arrow-left" [outlined]="true"
                        (onClick)="currentStep.set(0)"></p-button>
              <p-button label="Place Order" icon="pi pi-check" 
                        [loading]="checkoutService.isProcessing()"
                        (onClick)="onSubmit()"
                        [disabled]="checkoutForm.invalid"></p-button>
            </div>
          </p-card>
        }
      </div>

      <!-- Order Summary -->
      <div class="col-12 lg:col-4">
        <p-card header="Order Summary">
          <div class="flex flex-column gap-3 max-h-20rem overflow-y-auto">
            @for (item of cartStore.cart()?.items; track item.productId) {
              <div class="flex gap-3">
                <div class="surface-100 border-round flex align-items-center justify-content-center"
                     style="width: 50px; height: 50px;">
                  <i class="pi pi-box text-xl text-400"></i>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ item.productName }}</div>
                  <div class="text-500 text-xs">Qty: {{ item.quantity }}</div>
                </div>
                <div class="font-medium">{{ item.totalPrice | currency }}</div>
              </div>
            }
          </div>
          
          <p-divider></p-divider>
          
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between text-sm">
              <span class="text-500">Subtotal</span>
              <span class="font-medium">{{ cartStore.totalPrice() | currency }}</span>
            </div>
            <div class="flex justify-content-between text-sm">
              <span class="text-500">Shipping</span>
              <span class="font-medium text-green-500">Free</span>
            </div>
            <p-divider></p-divider>
            <div class="flex justify-content-between">
              <span class="font-semibold">Total</span>
              <span class="text-xl font-bold text-primary">{{ cartStore.totalPrice() | currency }}</span>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .max-h-20rem { max-height: 20rem; }
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
