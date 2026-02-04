import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { GalleriaModule } from 'primeng/galleria';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    InputNumberModule,
    SkeletonModule,
    BreadcrumbModule,
    DividerModule,
    MessageModule,
    GalleriaModule
  ],
  template: `
    <!-- Breadcrumb -->
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" styleClass="mb-4"></p-breadcrumb>

    @if (loading()) {
      <!-- Loading Skeleton -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <p-skeleton width="100%" height="400px"></p-skeleton>
        </div>
        <div class="col-12 md:col-6">
          <p-skeleton width="30%" height="1rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton width="80%" height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton width="40%" height="2.5rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton width="100%" height="5rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton width="100%" height="3rem"></p-skeleton>
        </div>
      </div>
    } @else if (product()) {
      <div class="grid animate-fade-in">
        <!-- Product Image -->
        <div class="col-12 md:col-6">
          <div class="surface-100 border-round flex align-items-center justify-content-center"
               style="height: 400px;">
            <i class="pi pi-box text-8xl text-300"></i>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-12 md:col-6">
          <div class="flex flex-column gap-3">
            <!-- SKU Badge -->
            <p-tag [value]="product()?.sku" severity="secondary"></p-tag>
            
            <!-- Title -->
            <h1 class="text-3xl font-bold m-0">{{ product()?.name }}</h1>
            
            <!-- Price -->
            <div class="flex align-items-center gap-3">
              <span class="text-4xl font-bold text-primary">{{ product()?.price | currency }}</span>
              <span class="text-xl text-500 line-through">{{ (product()?.price ?? 0) * 1.2 | currency }}</span>
              <p-tag value="20% OFF" severity="success"></p-tag>
            </div>
            
            <!-- Stock Status -->
            <div class="flex align-items-center gap-2">
              @if ((product()?.stockQuantity ?? 0) > 10) {
                <i class="pi pi-check-circle text-green-500"></i>
                <span class="text-green-500 font-medium">In Stock</span>
              } @else if ((product()?.stockQuantity ?? 0) > 0) {
                <i class="pi pi-exclamation-circle text-orange-500"></i>
                <span class="text-orange-500 font-medium">Low Stock - Only {{ product()?.stockQuantity }} left</span>
              } @else {
                <i class="pi pi-times-circle text-red-500"></i>
                <span class="text-red-500 font-medium">Out of Stock</span>
              }
            </div>
            
            <!-- Description -->
            <p class="text-500 line-height-3 m-0">{{ product()?.description }}</p>
            
            <p-divider></p-divider>
            
            <!-- Add to Cart -->
            <div class="flex align-items-center gap-3">
              <p-inputNumber [(ngModel)]="quantity" 
                             [showButtons]="true" 
                             buttonLayout="horizontal"
                             [min]="1" [max]="99"
                             decrementButtonClass="p-button-outlined"
                             incrementButtonClass="p-button-outlined"
                             inputStyleClass="w-3rem text-center">
              </p-inputNumber>
              
              <p-button label="Add to Cart" icon="pi pi-shopping-cart"
                        [loading]="isAdding()"
                        (onClick)="addToCart()"
                        styleClass="flex-1"></p-button>
            </div>

            <!-- Success Message -->
            @if (addedMessage()) {
              <p-message severity="success" 
                         [text]="'Added ' + quantity + ' item(s) to your cart!'"
                         styleClass="w-full">
              </p-message>
            }

            <p-divider></p-divider>
            
            <!-- Features -->
            <div class="grid">
              <div class="col-6">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-truck text-xl text-primary"></i>
                  <div>
                    <div class="font-medium">Free Shipping</div>
                    <div class="text-500 text-sm">On orders over $50</div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-verified text-xl text-primary"></i>
                  <div>
                    <div class="font-medium">Money Back</div>
                    <div class="text-500 text-sm">30-day guarantee</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <!-- Not Found -->
      <p-card>
        <div class="text-center py-6">
          <i class="pi pi-search text-6xl text-300 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Product not found</h3>
          <p class="text-500 mb-4">The product you're looking for doesn't exist.</p>
          <a routerLink="/" pButton label="Back to Products" icon="pi pi-arrow-left"></a>
        </div>
      </p-card>
    }
  `,
  styles: [`
    :host { display: block; }
    .line-through { text-decoration: line-through; }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly cartStore = inject(CartStore);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly addedMessage = signal(false);
  readonly isAdding = signal(false);

  quantity = 1;

  readonly homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems: MenuItem[] = [
    { label: 'Products', routerLink: '/products' },
    { label: 'Loading...' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.catalogService.getProduct(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.breadcrumbItems = [
            { label: 'Products', routerLink: '/products' },
            { label: p.name }
          ];
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

    this.isAdding.set(true);
    await this.cartStore.addItem(p, this.quantity);
    this.isAdding.set(false);
    this.addedMessage.set(true);
    setTimeout(() => this.addedMessage.set(false), 3000);
  }
}
