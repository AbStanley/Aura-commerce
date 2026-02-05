import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistStore } from './wishlist.store';
import { CatalogService, Product } from './catalog.service';
import { ProductCardComponent } from './product-card.component';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [
        CommonModule,
        ProductCardComponent,
        ButtonModule,
        SkeletonModule,
        RouterLink
    ],
    template: `
    <div class="container animate-fade-in">
        <div class="flex flex-column gap-4 py-6">
            <div class="flex align-items-center justify-content-between">
                <div>
                     <h1 class="text-3xl font-bold m-0 mb-2">My Wishlist</h1>
                     <p class="text-500 m-0">Your saved items for later</p>
                </div>
                <p-button label="Continue Shopping" icon="pi pi-arrow-left" routerLink="/" styleClass="p-button-outlined"></p-button>
            </div>

            @if (loading()) {
                <div class="grid">
                    @for (i of [1,2,3,4]; track i) {
                        <div class="col-12 sm:col-6 lg:col-3">
                             <div class="surface-card p-3 border-round">
                                 <p-skeleton height="200px" styleClass="mb-2"></p-skeleton>
                                 <p-skeleton width="60%" height="1rem" styleClass="mb-2"></p-skeleton>
                                 <p-skeleton width="40%" height="1rem"></p-skeleton>
                             </div>
                        </div>
                    }
                </div>
            } @else if (products().length === 0) {
                <div class="surface-card border-round-xl p-6 text-center shadow-1">
                    <div class="mb-4">
                        <i class="pi pi-heart text-6xl text-300"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-900 mb-2">Your wishlist is empty</h2>
                    <p class="text-500 mb-4">Seems like you haven't saved any items yet.</p>
                    <p-button label="Explore Products" icon="pi pi-search" routerLink="/"></p-button>
                </div>
            } @else {
                <div class="grid">
                    @for (product of products(); track product.id) {
                         <div class="col-12 sm:col-6 lg:col-4 xl:col-3 animate-fade-in">
                             <app-product-card [product]="product"></app-product-card>
                         </div>
                    }
                </div>
            }
        </div>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class WishlistComponent implements OnInit {
    private readonly wishlist = inject(WishlistStore);
    private readonly catalog = inject(CatalogService);

    readonly loading = signal(true);
    readonly products = signal<Product[]>([]);

    constructor() {
        effect(() => {
            this.wishlist.count();
            this.loadProducts();
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.loadProducts();
    }

    private loadProducts() {
        const ids = this.wishlist.getIds();
        if (ids.length === 0) {
            this.products.set([]);
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        let loaded: Product[] = [];
        let completed = 0;

        ids.forEach(id => {
            this.catalog.getProduct(id).subscribe({
                next: (p) => {
                    loaded.push(p);
                    completed++;
                    if (completed === ids.length) this.finalize(loaded);
                },
                error: () => {
                    completed++;
                    if (completed === ids.length) this.finalize(loaded);
                }
            });
        });
    }

    private finalize(products: Product[]) {
        this.products.set(products);
        this.loading.set(false);
    }
}
