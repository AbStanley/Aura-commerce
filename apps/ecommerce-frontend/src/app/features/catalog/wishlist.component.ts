import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WishlistStore } from './wishlist.store';
import { CatalogService, Product } from './catalog.service';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { CartStore } from '../cart/cart.store';
import { AuthStore } from '../auth/auth.store';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [
        CommonModule,
        ProductCardComponent,
        ButtonModule,
        SkeletonModule,
        RouterLink,
        ToastModule
    ],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
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
                             <app-product-card 
                                [product]="product"
                                [isWishlisted]="true"
                                [isAdding]="addingProductId() === product.id"
                                (addToCart)="onAddToCart($event)"
                                (toggleWishlist)="onRemoveFromWishlist($event)"
                                (cardClick)="onCardClick($event)"
                             ></app-product-card>
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
    private readonly cartStore = inject(CartStore);
    private readonly authStore = inject(AuthStore);
    private readonly msgService = inject(MessageService);
    private readonly router = inject(Router);

    readonly loading = signal(true);
    readonly products = signal<Product[]>([]);
    readonly addingProductId = signal<string | null>(null);

    constructor() {
        effect(() => {
            // React to wishlist changes to reload products if needed
            const ids = this.wishlist.getIds(); // dependency tracking
            if (!this.loading()) {
                // naive reload or filter currently loaded
                this.products.update(current => current.filter(p => ids.includes(p.id)));
            }
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
                },
                complete: () => {
                    completed++;
                    if (completed === ids.length) this.finalize(loaded);
                },
                error: () => {
                    completed++;
                    if (completed === ids.length) this.finalize(loaded);
                }
            });
        });

        // Safety timeout if observable never completes (though getProduct is single emission)
    }

    private finalize(products: Product[]) {
        this.products.set(products);
        this.loading.set(false);
    }

    onCardClick(product: Product) {
        this.router.navigate(['/products', product.id]);
    }

    async onAddToCart(product: Product) {
        if (!product.stockQuantity || product.stockQuantity <= 0) return;

        this.addingProductId.set(product.id);
        await this.cartStore.addItem(product, 1);
        this.addingProductId.set(null);

        this.msgService.add({
            severity: 'success',
            summary: 'Added to Cart',
            detail: `Added ${product.name}`,
            life: 2000
        });
    }

    async onRemoveFromWishlist(product: Product) {
        await this.wishlist.toggleItem({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl
        });

        this.msgService.add({
            severity: 'info',
            summary: 'Removed',
            detail: `${product.name} removed from wishlist`,
            life: 2000
        });
        // Effect will handle UI update
    }
}
