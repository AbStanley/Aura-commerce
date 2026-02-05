import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CartService', () => {
    let service: CartService;
    let httpMock: HttpTestingController;
    const baseUrl = 'http://api.test';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CartService,
                provideZonelessChangeDetection(),
                { provide: API_BASE_URL, useValue: baseUrl }
            ]
        });
        service = TestBed.inject(CartService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get cart', () => {
        service.getCart('user1').subscribe();
        const req = httpMock.expectOne(`${baseUrl}/api/cart?userId=user1`);
        expect(req.request.method).toBe('GET');
        req.flush({ items: [] });
    });

    it('should add item', () => {
        const item = { id: 'p1', name: 'Product 1', price: 100 };
        service.addItem('user1', item, 2).subscribe();

        const req = httpMock.expectOne(`${baseUrl}/api/cart/items`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({
            productId: 'p1',
            productName: 'Product 1',
            unitPrice: 100,
            quantity: 2,
            userId: 'user1'
        });
        req.flush({});
    });
});
