import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from './catalog.service';
import { ProductCardComponent } from './product-card.component';

// PrimeNG Components
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    SkeletonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <!-- Hero Section -->
    <section class="text-center mb-6">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">
        Discover Our <span class="text-primary">Products</span>
      </h1>
      <p class="text-500 text-lg max-w-30rem mx-auto mb-5">
        Browse our curated collection of premium products designed for modern living.
      </p>
      
      <!-- Search -->
      <p-iconfield class="w-full max-w-25rem mx-auto">
        <p-inputicon styleClass="pi pi-search"></p-inputicon>
        <input type="text" pInputText 
               placeholder="Search products..." 
               class="w-full"
               (input)="onSearch($event)" />
      </p-iconfield>
    </section>

    <!-- Products Grid -->
    @if (catalog.products().length === 0) {
      <!-- Skeleton Loading -->
      <div class="grid">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="col-12 md:col-6 lg:col-4 xl:col-3">
            <div class="surface-card border-round p-3">
              <p-skeleton width="100%" height="200px" styleClass="mb-3"></p-skeleton>
              <p-skeleton width="60%" height="1rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="100%" height="1.5rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="80%" height="1rem" styleClass="mb-3"></p-skeleton>
              <div class="flex justify-content-between">
                <p-skeleton width="30%" height="2rem"></p-skeleton>
                <p-skeleton shape="circle" width="2.5rem" height="2.5rem"></p-skeleton>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="grid">
        @for (product of catalog.products(); track product.id; let i = $index) {
          <div class="col-12 md:col-6 lg:col-4 xl:col-3 animate-fade-in" 
               [style.animation-delay]="(i * 50) + 'ms'">
            <app-product-card [product]="product"></app-product-card>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .max-w-30rem { max-width: 30rem; }
    .max-w-25rem { max-width: 25rem; }
  `]
})
export class ProductListComponent {
  readonly catalog = inject(CatalogService);

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.catalog.state.setSearch(value);
  }
}
