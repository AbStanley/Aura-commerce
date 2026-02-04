import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../auth/auth.store';
import { UserService } from './user.service';
import { OrderService, Order } from '../orders/order.service';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';

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
    TableModule
  ],
  template: `
    <div class="grid">
      <!-- Profile Card -->
      <div class="col-12 lg:col-4">
        <p-card>
          <div class="text-center mb-4">
            <p-avatar [label]="getInitials()" size="xlarge" shape="circle"
                      styleClass="bg-primary text-white mb-3"></p-avatar>
            <h2 class="text-xl font-semibold m-0">{{ userEmail() }}</h2>
            <span class="text-500">Member since 2024</span>
          </div>
          
          <p-divider></p-divider>
          
          @if (isLoadingProfile()) {
            <div class="flex flex-column gap-3">
              <p-skeleton height="2.5rem"></p-skeleton>
              <p-skeleton height="2.5rem"></p-skeleton>
              <p-skeleton height="2.5rem"></p-skeleton>
            </div>
          } @else {
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" 
                  class="flex flex-column gap-3">
              <div class="flex flex-column gap-2">
                <label class="font-medium">First Name</label>
                <input pInputText formControlName="firstName" class="w-full" />
              </div>
              <div class="flex flex-column gap-2">
                <label class="font-medium">Last Name</label>
                <input pInputText formControlName="lastName" class="w-full" />
              </div>
              <div class="flex flex-column gap-2">
                <label class="font-medium">Email</label>
                <input pInputText [value]="userEmail()" [disabled]="true" class="w-full" />
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
        </p-card>
      </div>

      <!-- Order History -->
      <div class="col-12 lg:col-8">
        <p-card header="Order History">
          @if (ordersLoading()) {
            <div class="flex flex-column gap-3">
              @for (i of [1, 2, 3]; track i) {
                <div class="flex align-items-center gap-4 p-3 surface-50 border-round">
                  <p-skeleton width="100px" height="1rem"></p-skeleton>
                  <p-skeleton width="150px" height="1rem"></p-skeleton>
                  <p-skeleton width="80px" height="1.5rem"></p-skeleton>
                  <p-skeleton width="100px" height="1.5rem"></p-skeleton>
                </div>
              }
            </div>
          } @else if (orders().length === 0) {
            <div class="text-center py-6">
              <i class="pi pi-inbox text-6xl text-300 mb-4"></i>
              <h3 class="text-xl font-semibold mb-2">No orders yet</h3>
              <p class="text-500">Start shopping to see your orders here!</p>
            </div>
          } @else {
            <p-table [value]="orders()" [tableStyle]="{ 'min-width': '50rem' }"
                     styleClass="p-datatable-sm">
              <ng-template #header>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </ng-template>
              <ng-template #body let-order>
                <tr>
                  <td>
                    <span class="font-mono text-sm">{{ order.id.slice(0, 8) }}...</span>
                  </td>
                  <td>{{ order.orderDate | date:'mediumDate' }}</td>
                  <td>
                    <p-tag [value]="getStatusLabel(order.status)" 
                           [severity]="getStatusSeverity(order.status)"></p-tag>
                  </td>
                  <td>
                    <span class="font-bold text-primary">{{ order.totalAmount | currency }}</span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </p-card>
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
