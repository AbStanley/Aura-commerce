import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap, tap, catchError, of } from 'rxjs';
import { AuthStore } from '../auth/auth.store';
import { CartStore } from '../cart/cart.store';
import { OrderService, PlaceOrderCommand } from '../orders/order.service';

@Injectable({
    providedIn: 'root'
})
export class CheckoutService {
    private readonly orderService = inject(OrderService);
    private readonly cartStore = inject(CartStore);
    private readonly authStore = inject(AuthStore);
    private readonly router = inject(Router);

    // State signals
    readonly isProcessing = signal(false);
    readonly error = signal<string | null>(null);

    processCheckout(shippingAddress: PlaceOrderCommand['shippingAddress']) {
        const userId = this.authStore.userId();
        const cart = this.cartStore.cart();

        if (!userId || !cart) {
            this.error.set('Cart is empty or user not logged in');
            return;
        }

        this.isProcessing.set(true);
        this.error.set(null);

        const command: PlaceOrderCommand = {
            userId,
            items: cart.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                productName: i.productName || 'Unknown Product',
                unitPrice: i.unitPrice || 0
            })),
            shippingAddress
        };

        // Orchestration
        this.orderService.placeOrder(command).pipe(
            switchMap(orderRes => {
                // Mock Payment Logic - moved from Component
                return this.orderService.processPayment({
                    orderId: orderRes.orderId,
                    userId: userId,
                    amount: cart.totalAmount,
                    currency: 'USD',
                    paymentMethodId: 'pm_card_visa' // Ideally configurable
                });
            }),
            tap(() => {
                this.cartStore.clearCart();
                this.isProcessing.set(false);
                this.router.navigate(['/profile']);
            }),
            catchError(err => {
                console.error('Checkout failed', err);
                this.isProcessing.set(false);
                this.error.set('Failed to place order. Please try again.');
                return of(null);
            })
        ).subscribe();
    }
}
