import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    @if (loading()) {
        <div class="flex justify-center items-center py-20">
            <p class="text-gray-500">Loading product...</p>
        </div>
    } @else if (product()) {
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                <!-- Image gallery -->
                <div class="flex flex-col-reverse">
                    <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
                         <!-- Placeholder since we don't have real images yet -->
                         <div class="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">
                            {{ product()?.name }} Image
                         </div>
                    </div>
                </div>

                <!-- Product info -->
                <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">{{ product()?.name }}</h1>
                    
                    <div class="mt-3">
                        <h2 class="sr-only">Product information</h2>
                        <p class="text-3xl text-gray-900">\${{ product()?.price }}</p>
                    </div>

                    <div class="mt-6">
                        <h3 class="sr-only">Description</h3>
                        <div class="text-base text-gray-700 space-y-6" [innerHTML]="product()?.description"></div>
                    </div>

                    <div class="mt-8 flex gap-4">
                        <div class="w-24">
                            <label for="quantity" class="sr-only">Quantity</label>
                            <select id="quantity" [(ngModel)]="quantity" class="block w-full border-gray-300 rounded-md py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm border px-2">
                                <option [value]="1">1</option>
                                <option [value]="2">2</option>
                                <option [value]="3">3</option>
                                <option [value]="4">4</option>
                                <option [value]="5">5</option>
                            </select>
                        </div>

                        <button 
                            type="button"
                            (click)="addToCart()"
                            class="flex-1 bg-blue-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Add to bag
                        </button>
                    </div>

                    @if (addedMessage()) {
                        <p class="mt-4 text-green-600 font-medium animate-fade-in-down">
                            Successfully added to cart!
                        </p>
                    }
                </div>
            </div>
        </div>
    } @else {
        <div class="text-center py-20">
            <p class="text-gray-500">Product not found.</p>
        </div>
    }
  `
})
export class ProductDetailsComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly catalogService = inject(CatalogService);
    private readonly cartStore = inject(CartStore);

    readonly product = signal<Product | null>(null);
    readonly loading = signal(true);
    readonly addedMessage = signal(false);

    quantity = 1;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.catalogService.getProduct(id).subscribe({
                next: (p) => {
                    this.product.set(p);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        } else {
            this.loading.set(false);
        }
    }

    async addToCart() {
        const p = this.product();
        if (!p) return;

        await this.cartStore.addItem(p, this.quantity);
        this.addedMessage.set(true);
        setTimeout(() => this.addedMessage.set(false), 3000);
    }
}
