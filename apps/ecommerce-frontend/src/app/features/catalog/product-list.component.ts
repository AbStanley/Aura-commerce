import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from './catalog.service';
import { ProductCardComponent } from './product-card.component';

// PrimeNG Components
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
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
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <!-- Hero Section -->
    <section class="hero-section relative flex align-items-center justify-content-center text-center overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full hero-bg z-0"></div>
        <div class="relative z-1 px-4 sm:px-6 lg:px-8 py-8 md:py-16 fadeinup animation-duration-1000">
            <h1 class="text-5xl md:text-7xl font-extrabold mb-4 text-white tight-spacing">
                Elevate Your <span class="text-primary-300">Lifestyle</span>
            </h1>
            <p class="text-xl md:text-2xl text-white-alpha-90 mb-6 max-w-30rem mx-auto line-height-3 text-shadow-1">
                Discover a curated collection of premium products designed for modern living.
            </p>
            <div class="flex flex-column sm:flex-row gap-3 justify-content-center">
                 <button pButton label="Shop Collection" icon="pi pi-arrow-right" iconPos="right" 
                         class="p-button-lg p-button-rounded p-button-raised border-none bg-white text-primary-900 font-bold px-5"></button>
            </div>
        </div>
    </section>

    <!-- Features Ribbon -->
    <section class="surface-0 py-4 border-bottom-1 surface-border">
        <div class="container flex flex-wrap justify-content-center gap-4 md:gap-8">
            <div class="flex align-items-center gap-2 text-700">
                <i class="pi pi-check-circle text-green-500 text-xl"></i>
                <span class="font-medium">Free Shipping</span>
            </div>
             <div class="flex align-items-center gap-2 text-700">
                <i class="pi pi-shield text-blue-500 text-xl"></i>
                <span class="font-medium">Secure Payment</span>
            </div>
             <div class="flex align-items-center gap-2 text-700">
                <i class="pi pi-undo text-orange-500 text-xl"></i>
                <span class="font-medium">30-Day Returns</span>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <div class="container py-6 relative">
        
        <!-- Search & Filter Header -->
        <div class="flex flex-column md:flex-row justify-content-between align-items-center mb-6 gap-3 sticky-header bg-white-alpha-90 backdrop-blur pb-3 pt-3 z-2">
            <div>
                 <h2 class="text-3xl font-bold text-900 m-0">Latest Arrivals</h2>
                 <p class="text-500 m-0 text-sm">Freshly added to our catalog</p>
            </div>

            <div class="relative w-full md:w-auto" style="min-width: 300px;">
                <p-iconfield class="w-full">
                    <p-inputicon styleClass="pi pi-search"></p-inputicon>
                    <input type="text" pInputText
                           [(ngModel)]="searchQuery"
                           placeholder="Search products..."
                           class="w-full search-input border-round-2xl shadow-1 border-none surface-100 focused:surface-white transition-colors"
                           (input)="onSearch()" />
                </p-iconfield>
                 @if (searchQuery) {
                    <button type="button" 
                            class="absolute p-button p-button-text p-button-rounded p-button-sm text-600"
                            style="right: 4px; top: 50%; transform: translateY(-50%);"
                            (click)="clearSearch()">
                      <i class="pi pi-times"></i>
                    </button>
                  }
            </div>
        </div>

        <!-- Products Grid -->
        @if (catalog.products().length === 0 && !searchQuery) {
            <!-- Skeleton Loading -->
            <div class="grid">
                @for (i of [1,2,3,4,5,6,7,8]; track i) {
                    <div class="col-12 sm:col-6 lg:col-4 xl:col-3">
                        <div class="surface-card border-round-xl p-3 shadow-1 h-full">
                            <p-skeleton width="100%" height="220px" styleClass="mb-3 border-round-lg"></p-skeleton>
                            <p-skeleton width="60%" height="1rem" styleClass="mb-2"></p-skeleton>
                            <p-skeleton width="40%" height="0.8rem" styleClass="mb-3"></p-skeleton>
                            <div class="flex justify-content-between">
                                <p-skeleton width="30%" height="1.5rem"></p-skeleton>
                                <p-skeleton shape="circle" size="2.5rem"></p-skeleton>
                            </div>
                        </div>
                    </div>
                }
            </div>
        } @else if (catalog.products().length === 0 && searchQuery) {
             <!-- No Results -->
            <div class="flex flex-column align-items-center justify-content-center py-8 text-center animate-fade-in">
                <div class="surface-50 border-circle p-4 mb-3">
                    <i class="pi pi-search text-4xl text-400"></i>
                </div>
                <h3 class="text-xl font-semibold text-900 mb-2">No products found</h3>
                <p class="text-500 mb-4 max-w-20rem">We couldn't find any items matching "<span class="font-bold">{{searchQuery}}</span>".</p>
                <p-button label="Clear Search" icon="pi pi-refresh" (onClick)="clearSearch()" styleClass="p-button-outlined p-button-rounded"></p-button>
            </div>
        } @else {
             <!-- Active Grid -->
            <div class="grid">
                @for (product of catalog.products(); track product.id; let i = $index) {
                    <div class="col-12 sm:col-6 lg:col-4 xl:col-3 animate-up" 
                         [style.animation-delay]="(i * 30) + 'ms'">
                        <app-product-card [product]="product"></app-product-card>
                    </div>
                }
            </div>
        }
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .hero-section {
        height: 60vh;
        min-height: 400px;
        background: linear-gradient(135deg, var(--primary-700), var(--primary-900));
    }
    
    .hero-bg {
        background-image: url('https://primefaces.org/cdn/primeng/images/galleria/galleria10.jpg'); /* Placeholder abstract or lifestyle */
        background-size: cover;
        background-position: center;
        opacity: 0.3;
        mix-blend-mode: overlay;
    }

    .search-input {
        padding: 0.75rem 2.5rem;
    }
    
    .search-input:focus {
        box-shadow: 0 0 0 2px var(--primary-200) !important;
    }

    .sticky-header {
        position: sticky;
        top: 0;
        margin-top: -1rem; /* Offset for better sticky feel */
    }

    .tight-spacing {
        letter-spacing: -1px;
    }

    .text-shadow-1 {
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .animate-up {
        animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes fadeUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
  `]
})
export class ProductListComponent {
  readonly catalog = inject(CatalogService);
  searchQuery = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  onSearch() {
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.catalog.state.setSearch(this.searchQuery);
    }, 300);
  }

  clearSearch() {
    this.searchQuery = '';
    this.catalog.state.setSearch('');
  }
}
