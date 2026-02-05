import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { CatalogService } from './catalog.service';
import { MessageService } from 'primeng/api';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { CartStore } from '../cart/cart.store';
import { WishlistStore } from './wishlist.store';
import { AuthStore } from '../auth/auth.store';
import { provideRouter } from '@angular/router';

describe('ProductListComponent', () => {
    let component: ProductListComponent;
    let fixture: ComponentFixture<ProductListComponent>;
    let mockCatalogService: any;

    beforeEach(async () => {
        mockCatalogService = {
            products: signal([]),
            state: {
                searchQuery: signal(''),
                selectedCategory: signal(null)
            }
        };

        await TestBed.configureTestingModule({
            imports: [ProductListComponent],
            providers: [
                { provide: CatalogService, useValue: mockCatalogService },
                provideZonelessChangeDetection(),
                { provide: CartStore, useValue: { addItem: vi.fn(), count: signal(0) } },
                { provide: WishlistStore, useValue: { hasItem: () => signal(false), toggleItem: vi.fn(), getIds: () => [] } },
                { provide: AuthStore, useValue: { isAuthenticated: signal(true) } },
                { provide: API_BASE_URL, useValue: 'http://api.test' },
                provideRouter([]),
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display products when available', () => {
        mockCatalogService.products.set([
            { id: '1', name: 'Test Product', price: 100 }
        ]);
        fixture.detectChanges();

        const productCards = fixture.nativeElement.querySelectorAll('app-product-card');
        expect(productCards.length).toBe(1);
    });

    it('should show no results message when search yields nothing', () => {
        mockCatalogService.state.searchQuery.set('Nonexistent');
        mockCatalogService.products.set([]);
        fixture.detectChanges();

        const noResults = fixture.nativeElement.querySelector('.text-xl.font-bold');
        expect(noResults.textContent).toContain('No results for "Nonexistent"');
    });
});
