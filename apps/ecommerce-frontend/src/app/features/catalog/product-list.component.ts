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
    <section class="text-center mb-6 pt-4 animate-fade-in">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">
        Discover Our <span class="gradient-text">Products</span>
      </h1>
      <p class="text-500 text-lg mb-5 line-height-3" style="max-width: 32rem; margin: 0 auto;">
        Browse our curated collection of premium products designed for modern living.
      </p>
      
      <!-- Search Bar -->
      <div class="flex justify-content-center gap-2">
        <div class="relative w-full" style="max-width: 450px;">
          <p-iconfield class="w-full">
            <p-inputicon styleClass="pi pi-search"></p-inputicon>
            <input type="text" pInputText 
                   [(ngModel)]="searchQuery"
                   placeholder="Search products..." 
                   class="w-full search-input"
                   style="padding-left: 2.5rem; padding-right: 2.5rem;"
                   (input)="onSearch()" />
          </p-iconfield>
          @if (searchQuery) {
            <button type="button" 
                    class="absolute p-button p-button-text p-button-rounded p-button-sm"
                    style="right: 4px; top: 50%; transform: translateY(-50%);"
                    (click)="clearSearch()">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>
      </div>

      <!-- Search Results Info -->
      @if (searchQuery && catalog.products().length > 0) {
        <p class="text-500 text-sm mt-3 animate-fade-in">
          Found <span class="font-semibold text-primary">{{ catalog.products().length }}</span> 
          products matching "<span class="font-medium">{{ searchQuery }}</span>"
        </p>
      }
    </section>

    <!-- Products Grid -->
    @if (catalog.products().length === 0 && !searchQuery) {
      <!-- Skeleton Loading -->
      <div class="grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <div class="col-12 sm:col-6 lg:col-4 xl:col-3">
            <div class="surface-card border-round-xl p-3 shadow-1">
              <p-skeleton width="100%" height="200px" styleClass="mb-3 border-round-lg"></p-skeleton>
              <p-skeleton width="60%" height="0.75rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="40%" height="0.65rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="90%" height="1.25rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="100%" height="2rem" styleClass="mb-3"></p-skeleton>
              <div class="flex justify-content-between align-items-center">
                <p-skeleton width="35%" height="1.75rem"></p-skeleton>
                <p-skeleton shape="circle" width="2.5rem" height="2.5rem"></p-skeleton>
              </div>
            </div>
          </div>
        }
      </div>
    } @else if (catalog.products().length === 0 && searchQuery) {
      <!-- No Results -->
      <div class="surface-card border-round-xl p-6 shadow-1 text-center mt-4 animate-fade-in">
        <i class="pi pi-search text-6xl text-300 mb-3 block"></i>
        <h3 class="text-xl font-semibold text-900 mb-2">No products found</h3>
        <p class="text-500 mb-4">Try adjusting your search or browse all products.</p>
        <p-button label="Clear Search" icon="pi pi-times" (onClick)="clearSearch()"></p-button>
      </div>
    } @else {
      <div class="grid">
        @for (product of catalog.products(); track product.id; let i = $index) {
          <div class="col-12 sm:col-6 lg:col-4 xl:col-3 animate-fade-in" 
               [style.animation-delay]="(i * 50) + 'ms'">
            <app-product-card [product]="product"></app-product-card>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .search-input {
      border-radius: 2rem;
      padding-top: 0.875rem;
      padding-bottom: 0.875rem;
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
