import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { Cart } from './cart.store';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    getCart(userId: string): Observable<Cart> {
        return this.http.get<Cart>(`${this.baseUrl}/api/cart?userId=${userId}`);
    }

    addItem(userId: string, item: { id: string; name: string; price: number }, quantity: number): Observable<unknown> {
        return this.http.post(`${this.baseUrl}/api/cart/items`, {
            productId: item.id,
            productName: item.name,
            unitPrice: item.price,
            quantity,
            userId
        });
    }

    updateQuantity(userId: string, productId: string, quantity: number): Observable<unknown> {
        return this.http.put(`${this.baseUrl}/api/cart/items/${productId}`, {
            productId,
            quantity,
            userId
        });
    }

    removeItem(userId: string, productId: string): Observable<unknown> {
        return this.http.delete(`${this.baseUrl}/api/cart/items/${productId}?userId=${userId}`);
    }

    clearCart(userId: string): Observable<unknown> {
        return this.http.delete(`${this.baseUrl}/api/cart?userId=${userId}`);
    }
}
