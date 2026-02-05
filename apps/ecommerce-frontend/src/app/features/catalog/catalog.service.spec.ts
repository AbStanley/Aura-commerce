import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import { API_BASE_URL } from '../../core/api/api.configuration';
import { CatalogStateStore } from './catalog.store';
import { signal, provideZonelessChangeDetection } from '@angular/core';

describe('CatalogService', () => {
    let service: CatalogService;
    let httpMock: HttpTestingController;
    const baseUrl = 'http://api.test';

    beforeEach(() => {
        const selectedCategorySignal = signal<string | null>(null);
        const searchQuerySignal = signal<string>('');

        const mockStore = {
            selectedCategory: selectedCategorySignal,
            searchQuery: searchQuerySignal,
            setCategory: vi.fn((id: string | null) => selectedCategorySignal.set(id)),
            setSearch: vi.fn((q: string) => searchQuerySignal.set(q))
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CatalogService,
                provideZonelessChangeDetection(),
                { provide: API_BASE_URL, useValue: baseUrl },
                { provide: CatalogStateStore, useValue: mockStore }
            ]
        });
        service = TestBed.inject(CatalogService);
        httpMock = TestBed.inject(HttpTestingController);

        const catReq = httpMock.expectOne(`${baseUrl}/api/categories`);
        catReq.flush([{ id: '1', name: 'Tech' }]);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have loaded categories', () => {
        expect(service.categories()).toEqual([{ id: '1', name: 'Tech' }]);
    });

    it('should fetch products when no category selected', () => {
        service.state.setSearch('');
        TestBed.flushEffects();

        const req = httpMock.expectOne(`${baseUrl}/api/products?page=1&pageSize=20`);
        expect(req.request.method).toBe('GET');
        req.flush({ items: [], totalCount: 0 });
    });

    it('should filter products by category', () => {
        service.state.setCategory('123');
        TestBed.flushEffects();

        const req = httpMock.expectOne(`${baseUrl}/api/products?page=1&pageSize=20&categoryId=123`);
        expect(req.request.method).toBe('GET');
        req.flush({ items: [], totalCount: 0 });
    });
});
