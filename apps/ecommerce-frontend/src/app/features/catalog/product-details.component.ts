import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { FormsModule } from '@angular/forms';

// PrimeNG Components
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BreadcrumbModule,
    TagModule,
    InputNumberModule,
    SkeletonModule,
    DividerModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <!-- Breadcrumb -->
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" styleClass="mb-4 surface-card border-round-lg"></p-breadcrumb>

    @if (isLoading()) {
      <!-- Loading Skeleton -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <p-skeleton width="100%" height="400px" styleClass="border-round-lg"></p-skeleton>
        </div>
        <div class="col-12 md:col-6">
          <p-skeleton width="30%" height="1rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton width="80%" height="2.5rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton width="50%" height="1rem" styleClass="mb-4"></p-skeleton>
          <p-skeleton width="100%" height="5rem" styleClass="mb-4"></p-skeleton>
          <p-skeleton width="40%" height="3rem" styleClass="mb-4"></p-skeleton>
          <div class="flex gap-2">
            <p-skeleton width="150px" height="3rem"></p-skeleton>
            <p-skeleton width="150px" height="3rem"></p-skeleton>
          </div>
        </div>
      </div>
    } @else if (product()) {
      <div class="grid">
        <!-- Product Image -->
        <div class="col-12 md:col-6 lg:col-5">
          <div class="surface-card border-round-xl p-4 shadow-1">
            <div class="relative overflow-hidden border-round-lg" style="height: 400px;">
              <div class="w-full h-full flex align-items-center justify-content-center surface-100">
                <i class="pi pi-box text-8xl text-300"></i>
              </div>
              
              <!-- Discount Badge -->
              @if (product()!.price > 50) {
                <div class="absolute bg-red-500 text-white font-bold px-3 py-1 border-round-xl text-sm"
                     style="top: 16px; right: 16px;">
                  -20% OFF
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-12 md:col-6 lg:col-7">
          <div class="pl-0 md:pl-4">
            <!-- SKU -->
            <span class="text-500 text-sm">SKU: {{ product()!.sku }}</span>
            
            <!-- Title -->
            <h1 class="text-3xl font-bold text-900 m-0 mt-2 mb-3">{{ product()!.name }}</h1>
            
            <!-- Stock Status -->
            <div class="flex align-items-center gap-2 mb-4">
              @if (product()!.stockQuantity > 10) {
                <p-tag value="In Stock" severity="success" icon="pi pi-check-circle"></p-tag>
                <span class="text-500">{{ product()!.stockQuantity }} available</span>
              } @else if (product()!.stockQuantity > 0) {
                <p-tag value="Low Stock" severity="warn" icon="pi pi-exclamation-triangle"></p-tag>
                <span class="text-orange-500 font-medium">Only {{ product()!.stockQuantity }} left!</span>
              } @else {
                <p-tag value="Out of Stock" severity="danger" icon="pi pi-times-circle"></p-tag>
              }
            </div>
            
            <!-- Description -->
            <p class="text-600 line-height-3 mb-4">{{ product()!.description }}</p>
            
            <!-- Price -->
            <div class="flex align-items-baseline gap-3 mb-5">
              <span class="text-4xl font-bold text-primary">{{ product()!.price | currency }}</span>
              @if (product()!.price > 50) {
                <span class="text-xl line-through text-400">{{ product()!.price * 1.25 | currency }}</span>
              }
            </div>
            
            <p-divider></p-divider>
            
            <!-- Quantity & Add to Cart -->
            <div class="flex align-items-center gap-3 mt-4 flex-wrap">
              <div class="flex flex-column gap-2">
                <label class="text-500 text-sm font-medium">Quantity</label>
                <p-inputNumber [(ngModel)]="quantity" 
                               [showButtons]="true" 
                               buttonLayout="horizontal"
                               [min]="1" 
                               [max]="product()!.stockQuantity"
                               decrementButtonClass="p-button-secondary p-button-outlined"
                               incrementButtonClass="p-button-secondary p-button-outlined"
                               inputStyleClass="w-3rem text-center"></p-inputNumber>
              </div>
              
              <p-button label="Add to Cart" icon="pi pi-shopping-cart" size="large"
                        [loading]="isAdding()"
                        [disabled]="product()!.stockQuantity === 0"
                        (onClick)="addToCart()"></p-button>
              
              <p-button icon="pi pi-heart" severity="secondary" [outlined]="true" size="large"
                        pTooltip="Add to wishlist"></p-button>
            </div>
            
            @if (addedMessage()) {
              <p-message severity="success" [text]="addedMessage()!" styleClass="mt-4 w-full"></p-message>
            }
            
            <!-- Features -->
            <div class="grid mt-5">
              <div class="col-6">
                <div class="flex align-items-center gap-2 text-600">
                  <i class="pi pi-truck text-primary text-xl"></i>
                  <span class="text-sm">Free Shipping</span>
                </div>
              </div>
              <div class="col-6">
                <div class="flex align-items-center gap-2 text-600">
                  <i class="pi pi-refresh text-primary text-xl"></i>
                  <span class="text-sm">30-Day Returns</span>
                </div>
              </div>
              <div class="col-6">
                <div class="flex align-items-center gap-2 text-600">
                  <i class="pi pi-shield text-primary text-xl"></i>
                  <span class="text-sm">2-Year Warranty</span>
                </div>
              </div>
              <div class="col-6">
                <div class="flex align-items-center gap-2 text-600">
                  <i class="pi pi-verified text-primary text-xl"></i>
                  <span class="text-sm">Authentic Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="surface-card border-round-lg p-6 shadow-1 text-center">
        <i class="pi pi-exclamation-circle text-6xl text-300 mb-3 block"></i>
        <h3 class="text-xl font-semibold text-900 mb-2">Product not found</h3>
        <p class="text-500 mb-4">The product you're looking for doesn't exist.</p>
        <a routerLink="/" pButton label="Back to Products" icon="pi pi-arrow-left"></a>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly isAdding = signal(false);
  readonly addedMessage = signal<string | null>(null);

  quantity = 1;

  readonly homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Products', routerLink: '/' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  async loadProduct(id: string) {
    this.isLoading.set(true);
    this.catalog.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.breadcrumbItems.push({ label: product.name });
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  async addToCart() {
    if (!this.product()) return;

    this.isAdding.set(true);
    await this.cartStore.addItem(this.product()!, this.quantity);
    this.isAdding.set(false);

    this.addedMessage.set(`Added ${this.quantity} item(s) to cart!`);
    setTimeout(() => this.addedMessage.set(null), 3000);
  }
}
