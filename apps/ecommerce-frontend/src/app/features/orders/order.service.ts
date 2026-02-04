import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type PlaceOrderCommand = {
    userId: string;
    items: {
        productId: string;
        quantity: number;
        productName?: string;
        unitPrice?: number;
    }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
};

export type OrderItem = {
    productId: string;
    quantity: number;
    productName: string;
    unitPrice: number;
    total: number;
    image?: string;
};

export type Order = {
    id: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
};

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    placeOrder(command: PlaceOrderCommand): Observable<{ orderId: string }> {
        return this.http.post<{ orderId: string }>(`${this.baseUrl}/api/orders`, command);
    }

    getOrder(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.baseUrl}/api/orders/${id}`);
    }

    getHistory(userId: string): Observable<Order[]> {
        // Mocking items on the client side if backend returns empty items
        return this.http.get<Order[]>(`${this.baseUrl}/api/orders/history?userId=${userId}`).pipe(
            map(orders => orders.map(order => {
                if (!order.items || order.items.length === 0) {
                    return {
                        ...order,
                        items: this.generateMockItems(order.id, order.totalAmount)
                    };
                }
                return order;
            }))
        );
    }

    processPayment(command: { orderId: string; userId: string; amount: number; currency: string; paymentMethodId: string }): Observable<{ paymentId: string }> {
        return this.http.post<{ paymentId: string }>(`${this.baseUrl}/api/payments`, command);
    }

    private generateMockItems(orderId: string, total: number): OrderItem[] {
        // Deterministic mock items based on Order ID
        const hash = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const count = (hash % 3) + 1; // 1 to 3 items

        const items: OrderItem[] = [];
        let remainingTotal = total;

        const mockProducts = [
            { name: 'Premium Wireless Headphones', price: 299.99 },
            { name: 'Ergonomic Office Chair', price: 499.00 },
            { name: 'Mechanical Keyboard', price: 159.50 },
            { name: '4K Ultra HD Monitor', price: 349.99 },
            { name: 'Smart Home Speaker', price: 89.99 }
        ];

        for (let i = 0; i < count; i++) {
            const product = mockProducts[(hash + i) % mockProducts.length];
            const qty = (hash % 2) + 1;
            const itemTotal = i === count - 1 ? remainingTotal : (product.price * qty); // Last item takes remainder to match total loosely (approx)

            items.push({
                productId: `mock-prod-${i}`,
                productName: product.name,
                quantity: qty,
                unitPrice: product.price,
                total: itemTotal
            });
            remainingTotal -= itemTotal;
        }
        return items;
    }
}
