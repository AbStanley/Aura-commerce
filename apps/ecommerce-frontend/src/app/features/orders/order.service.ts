import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { Observable } from 'rxjs';

export type PlaceOrderCommand = {
    userId: string;
    items: { productId: string; quantity: number }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
};

export type Order = {
    id: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    items: any[];
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
        return this.http.get<Order[]>(`${this.baseUrl}/api/orders/history?userId=${userId}`);
    }

    processPayment(command: { orderId: string; amount: number; paymentMethod: string }): Observable<{ paymentId: string }> {
        return this.http.post<{ paymentId: string }>(`${this.baseUrl}/api/payments`, command);
    }
}
