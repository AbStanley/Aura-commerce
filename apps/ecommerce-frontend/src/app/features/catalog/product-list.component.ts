import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from './catalog.service';
import { ProductCardComponent } from './product-card.component';

// PrimeNG Components
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ProductCardComponent,
        SkeletonModule,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
    
    <!-- Main Content -->
    <div class="surface-ground min-h-screen pb-6">
        <div class="container py-4 relative" style="max-width: 1500px;">
            
            <!-- Banner Ad (Mock) -->
            @if (!catalog.state.searchQuery()) {
                <div class="w-full h-20rem bg-cover bg-center mb-6 relative" style="background-image: url('https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg'); mask-image: linear-gradient(to bottom, black 60%, transparent 100%);">
                    <div class="absolute p-6" style="top: 20%;">
                        <h2 class="text-4xl font-bold text-white shadow-2 mb-2">New Arrivals in Tech</h2>
                        <a href="#" class="text-white underline hover:text-orange-200">Shop the collection</a>
                    </div>
                </div>
                <div style="margin-top: -8rem; position: relative; z-index: 1;"></div>
            } @else {
                <div class="bg-white p-3 shadow-sm mb-3 text-sm">
                    <span class="font-bold">{{ catalog.products().length }} results</span> for <span class="text-orange-700 font-bold">"{{catalog.state.searchQuery()}}"</span>
                </div>
            }
            
            <!-- Products Grid -->
            @if (catalog.products().length === 0 && !catalog.state.searchQuery()) {
                <!-- Skeleton Loading -->
                <div class="grid">
                    @for (i of [1,2,3,4,5,6,7,8]; track i) {
                        <div class="col-12 sm:col-6 lg:col-4 xl:col-3 p-1">
                            <div class="bg-white p-3 h-full">
                                <p-skeleton width="100%" height="220px" styleClass="mb-3"></p-skeleton>
                                <p-skeleton width="80%" height="1rem" styleClass="mb-2"></p-skeleton>
                                <p-skeleton width="40%" height="1rem"></p-skeleton>
                            </div>
                        </div>
                    }
                </div>
            } @else if (catalog.products().length === 0 && catalog.state.searchQuery()) {
                 <!-- No Results -->
                <div class="bg-white p-8 text-center border-round shadow-sm">
                    <h3 class="text-xl font-bold text-900 mb-2">No results for <span class="text-orange-700">"{{catalog.state.searchQuery()}}"</span>.</h3>
                    <p class="text-700 mb-4">Try checking your spelling or use more general terms.</p>
                </div>
            } @else {
                 <!-- Active Grid -->
                <div class="grid grid-nogutter">
                    @for (product of catalog.products(); track product.id; let i = $index) {
                        <div class="col-12 sm:col-6 md:col-4 lg:col-3 p-2">
                            <app-product-card [product]="product" class="h-full block"></app-product-card>
                        </div>
                    }
                </div>
            }
        </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class ProductListComponent {
    readonly catalog = inject(CatalogService);
    // Removed local search state as it is now in HeaderComponent/CatalogService
}
