import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../auth/auth.store';
import { UserService } from './user.service';
import { OrderService, Order } from '../orders/order.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-2xl font-bold text-primary">
            {{ getInitials() }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">My Account</h1>
          <p class="text-muted-foreground">{{ userEmail() }}</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Profile Settings -->
        <div class="lg:col-span-1">
          <div class="card p-6 space-y-6">
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile Settings
            </h2>
            
            @if (isLoadingProfile()) {
              <div class="space-y-4">
                <div class="h-10 skeleton rounded"></div>
                <div class="h-10 skeleton rounded"></div>
                <div class="h-10 skeleton rounded"></div>
              </div>
            } @else {
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-4">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">First Name</label>
                  <input formControlName="firstName" type="text" class="input">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Last Name</label>
                  <input formControlName="lastName" type="text" class="input">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-foreground">Email</label>
                  <input 
                    [value]="userEmail()" 
                    disabled 
                    type="email" 
                    class="input bg-muted text-muted-foreground cursor-not-allowed">
                </div>

                <button 
                  type="submit" 
                  [disabled]="profileForm.invalid || isSaving()"
                  class="btn btn-primary btn-md w-full">
                  @if (isSaving()) {
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving...
                  } @else {
                    Save Changes
                  }
                </button>
                
                @if (message()) {
                  <div class="flex items-center gap-2 text-sm animate-fade-in"
                       [class]="message()?.includes('success') ? 'text-green-600' : 'text-destructive'">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M5 13l4 4L19 7"/>
                    </svg>
                    {{ message() }}
                  </div>
                }
              </form>
            }
          </div>
        </div>

        <!-- Order History -->
        <div class="lg:col-span-2">
          <div class="card p-6 space-y-6">
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Order History
            </h2>
            
            @if (ordersLoading()) {
              <div class="space-y-4">
                @for (i of [1, 2, 3]; track i) {
                  <div class="p-4 border border-border rounded-lg">
                    <div class="flex justify-between mb-4">
                      <div class="h-4 skeleton rounded w-32"></div>
                      <div class="h-6 skeleton rounded w-20"></div>
                    </div>
                    <div class="h-4 skeleton rounded w-48"></div>
                  </div>
                }
              </div>
            } @else if (orders().length === 0) {
              <div class="text-center py-12">
                <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-foreground mb-2">No orders yet</h3>
                <p class="text-muted-foreground text-sm">Start shopping to see your orders here!</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (order of orders(); track order.id) {
                  <div class="border border-border rounded-lg overflow-hidden hover:border-primary/20 transition-colors">
                    <!-- Order Header -->
                    <div class="p-4 bg-muted/30 flex flex-wrap items-center justify-between gap-4">
                      <div class="space-y-1">
                        <p class="text-xs text-muted-foreground">
                          Order ID: <span class="font-mono text-foreground">{{ order.id.slice(0, 8) }}...</span>
                        </p>
                        <p class="text-sm text-muted-foreground">
                          {{ order.orderDate | date:'MMM d, y, h:mm a' }}
                        </p>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="badge" 
                              [class]="getStatusBadgeClass(order.status)">
                          {{ order.status }}
                        </span>
                        <span class="text-lg font-bold text-foreground">
                          {{ order.totalAmount | currency }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Order Items -->
                    @if (order.items && order.items.length > 0) {
                      <div class="p-4 divide-y divide-border">
                        @for (item of order.items; track item.productId) {
                          <div class="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                              <div class="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                                <span class="text-xl">📦</span>
                              </div>
                              <div>
                                <p class="font-medium text-foreground">{{ item.productName }}</p>
                                <p class="text-xs text-muted-foreground">Qty: {{ item.quantity }}</p>
                              </div>
                            </div>
                            <span class="font-medium text-foreground">{{ item.totalPrice | currency }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
    private readonly authStore = inject(AuthStore);
    private readonly userService = inject(UserService);
    private readonly orderService = inject(OrderService);
    private readonly fb = inject(FormBuilder);

    readonly isLoadingProfile = signal(true);
    readonly isSaving = signal(false);
    readonly message = signal<string | null>(null);

    readonly ordersLoading = signal(true);
    readonly orders = signal<Order[]>([]);

    readonly userEmail = this.authStore.userEmail;

    readonly profileForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
    });

    ngOnInit() {
        const userId = this.authStore.userId();
        if (userId) {
            this.loadData(userId);
        }
    }

    getInitials(): string {
        const first = this.profileForm.get('firstName')?.value || '';
        const last = this.profileForm.get('lastName')?.value || '';
        return (first.charAt(0) + last.charAt(0)).toUpperCase() || 'U';
    }

    getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'delivered':
                return 'badge-success';
            case 'pending':
            case 'processing':
                return 'badge-warning';
            case 'cancelled':
            case 'failed':
                return 'badge-destructive';
            default:
                return 'badge-secondary';
        }
    }

    loadData(userId: string) {
        this.userService.getProfile(userId).subscribe({
            next: (profile) => {
                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName
                });
                this.isLoadingProfile.set(false);
            },
            error: () => this.isLoadingProfile.set(false)
        });

        this.orderService.getHistory(userId).subscribe({
            next: (orders) => {
                this.orders.set(orders);
                this.ordersLoading.set(false);
            },
            error: () => this.ordersLoading.set(false)
        });
    }

    onUpdateProfile() {
        if (this.profileForm.invalid) return;

        const userId = this.authStore.userId();
        if (!userId) return;

        this.isSaving.set(true);
        this.message.set(null);

        const val = this.profileForm.getRawValue();

        this.userService.updateProfile(userId, {
            firstName: val.firstName!,
            lastName: val.lastName!
        }).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.message.set('Profile updated successfully.');
            },
            error: () => {
                this.isSaving.set(false);
                this.message.set('Failed to update profile.');
            }
        });
    }
}
