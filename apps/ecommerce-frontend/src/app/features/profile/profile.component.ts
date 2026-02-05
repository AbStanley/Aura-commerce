import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../auth/auth.store';
import { UserService } from './user.service';
import { OrderService, Order } from '../orders/order.service';
import { RouterLink } from '@angular/router';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    AvatarModule,
    TagModule,
    SkeletonModule,
    DividerModule,
    MessageModule,
    RouterLink
  ],
  template: `
    <div class="grid">
      <!-- Profile Card -->
      <div class="col-12 lg:col-4">
        <div class="surface-card border-round-lg p-4 shadow-1">
          <div class="text-center mb-4">
            <p-avatar [label]="getInitials()" size="xlarge" shape="circle"
                      styleClass="mb-3" 
                      [style]="{'background-color': 'var(--p-primary-color)', 'color': 'var(--p-primary-contrast-color)', 'font-size': '1.5rem'}">
            </p-avatar>
            <h2 class="text-xl font-semibold text-900 m-0 mb-1">{{ userEmail() }}</h2>
            <span class="text-500 text-sm">Member since 2024</span>
          </div>
          
          <p-divider></p-divider>
          
          @if (isLoadingProfile()) {
            <div class="flex flex-column gap-3">
              <p-skeleton height="2.5rem" styleClass="border-round"></p-skeleton>
              <p-skeleton height="2.5rem" styleClass="border-round"></p-skeleton>
              <p-skeleton height="2.5rem" styleClass="border-round"></p-skeleton>
            </div>
          } @else {
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" 
                  class="flex flex-column gap-4">
              <div class="flex flex-column gap-2">
                <label class="font-medium text-900">First Name</label>
                <input pInputText formControlName="firstName" class="w-full" />
              </div>
              <div class="flex flex-column gap-2">
                <label class="font-medium text-900">Last Name</label>
                <input pInputText formControlName="lastName" class="w-full" />
              </div>
              <div class="flex flex-column gap-2">
                <label class="font-medium text-900">Email</label>
                <input pInputText [value]="userEmail()" [disabled]="true" class="w-full surface-100" />
              </div>

              <p-button type="submit" label="Save Changes" icon="pi pi-check"
                        [loading]="isSaving()"
                        [disabled]="profileForm.invalid || isSaving()"
                        styleClass="w-full"></p-button>
              
              @if (message()) {
                <p-message [severity]="message()?.includes('success') ? 'success' : 'error'" 
                           [text]="message()!" styleClass="w-full"></p-message>
              }
            </form>
          }
        </div>
      </div>

    <!-- Order History -->
      <div class="col-12 lg:col-8">
        <div class="surface-card border-round-lg p-4 shadow-1">
          <h3 class="text-xl font-semibold text-900 m-0 mb-4">
            <i class="pi pi-list mr-2 text-primary"></i>
            Order History
          </h3>
          
          @if (ordersLoading()) {
            <div class="flex flex-column gap-3">
              @for (i of [1, 2, 3]; track i) {
                <div class="flex align-items-center gap-4 p-4 surface-50 border-round-lg">
                  <p-skeleton width="100px" height="1rem"></p-skeleton>
                  <p-skeleton width="100px" height="1rem"></p-skeleton>
                  <p-skeleton width="80px" height="1.5rem" styleClass="border-round-xl"></p-skeleton>
                  <p-skeleton width="80px" height="1.5rem"></p-skeleton>
                </div>
              }
            </div>
          } @else if (orders().length === 0) {
            <div class="text-center py-8 surface-50 border-round-xl">
              <i class="pi pi-inbox text-6xl text-300 mb-4 block"></i>
              <h4 class="text-xl font-semibold text-900 mb-2">No orders yet</h4>
              <p class="text-500 line-height-3 mb-4">Start shopping to see your orders here!</p>
              <p-button label="Browse Products" icon="pi pi-shopping-bag" routerLink="/products"></p-button>
            </div>
          } @else {
            <div class="flex flex-column gap-4">
              @for (order of orders(); track order.id) {
                <div class="border-1 surface-border border-round-xl overflow-hidden">
                  <!-- Order Header -->
                  <div class="surface-100 p-3 flex flex-wrap align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-4">
                      <div>
                        <span class="text-500 text-xs block mb-1">ORDER PLACED</span>
                        <span class="font-medium text-900">{{ order.orderDate | date:'mediumDate' }}</span>
                      </div>
                      <div>
                        <span class="text-500 text-xs block mb-1">TOTAL</span>
                        <span class="font-bold text-xl text-primary">{{ order.totalAmount | currency }}</span>
                      </div>
                    </div>
                    <div class="flex align-items-center gap-3">
                      <p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)"></p-tag>
                      <span class="text-500 text-sm">Order #{{ order.id.slice(0, 8).toUpperCase() }}</span>
                    </div>
                  </div>
                  
                  <!-- Order Items -->
                  <div class="p-3">
                    @for (item of order.items; track item.productId) {
                      <div class="flex align-items-center gap-3 py-2" [class.border-bottom-1]="!$last" [class.surface-border]="!$last">
                        <div class="surface-100 border-round flex align-items-center justify-content-center flex-shrink-0" style="width: 60px; height: 60px;">
                          <i class="pi pi-box text-2xl text-400"></i>
                        </div>
                        <div class="flex-1">
                          <span class="font-medium text-900 block mb-1">{{ item.productName }}</span>
                          <span class="text-500 text-sm">Qty: {{ item.quantity }} × {{ item.unitPrice | currency }}</span>
                        </div>
                        <span class="font-bold text-900">{{ item.unitPrice * item.quantity | currency }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
  `]
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

  getStatusLabel(status: string | number | undefined): string {
    const statusStr = String(status ?? '').toLowerCase();
    const labels: Record<string, string> = {
      'completed': 'Completed',
      'delivered': 'Delivered',
      'pending': 'Pending',
      'processing': 'Processing',
      'cancelled': 'Cancelled',
      'failed': 'Failed'
    };
    return labels[statusStr] || String(status);
  }

  getStatusSeverity(status: string | number | undefined): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const statusStr = String(status ?? '').toLowerCase();
    switch (statusStr) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warn';
      case 'cancelled':
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
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
      error: (err) => {
        this.isLoadingProfile.set(false);
        if (err.status === 404) {
          this.authStore.logout();
        }
      }
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
