import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../auth/auth.store';
import { UserService, UserProfile } from './user.service';
import { OrderService, Order } from '../orders/order.service';
import { switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Profile Settings -->
      <div class="md:col-span-1 border border-gray-200 rounded-lg p-6 bg-white h-fit">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        
        @if (isLoadingProfile()) {
            <p class="text-gray-500">Loading profile...</p>
        } @else {
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input formControlName="firstName" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input formControlName="lastName" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input [value]="userEmail()" disabled type="email" class="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm p-2 border text-gray-500 cursor-not-allowed">
            </div>

            <button 
                type="submit" 
                [disabled]="profileForm.invalid || isSaving()"
                class="w-full mt-4 bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50">
                @if (isSaving()) { Saving... } @else { Save Changes }
            </button>
            
            @if (message()) {
                <p class="text-green-600 text-sm mt-2 text-center">{{ message() }}</p>
            }
            </form>
        }
      </div>

      <!-- Order History -->
      <div class="md:col-span-2 border border-gray-200 rounded-lg p-6 bg-white">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Order History</h2>
        
        @if (ordersLoading()) {
            <p class="text-gray-500">Loading orders...</p>
        } @else if (orders().length === 0) {
            <p class="text-gray-500">No orders found.</p>
        } @else {
            <div class="space-y-6">
                @for (order of orders(); track order.id) {
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <p class="text-sm text-gray-500">Order ID: <span class="font-mono text-gray-900">{{ order.id }}</span></p>
                                <p class="text-sm text-gray-500">Date: {{ order.orderDate | date:'medium' }}</p>
                            </div>
                            <div class="text-right">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {{ order.status }}
                                </span>
                                <p class="text-lg font-bold text-gray-900 mt-1">\${{ order.totalAmount }}</p>
                            </div>
                        </div>
                        
                        <!-- Order Items (Assuming backend returns them, otherwise requires separate fetch) -->
                         @if (order.items && order.items.length > 0) {
                             <div class="divide-y divide-gray-100 border-t border-gray-100 mt-4 pt-4">
                                 @for (item of order.items; track item.productId) {
                                     <div class="py-2 flex justify-between text-sm">
                                         <span>{{ item.productName }} (x{{ item.quantity }})</span>
                                         <span>\${{ item.totalPrice }}</span>
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

    loadData(userId: string) {
        // 1. Load Profile
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

        // 2. Load Orders
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
