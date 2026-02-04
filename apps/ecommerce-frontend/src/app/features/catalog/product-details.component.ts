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
import { TooltipModule } from 'primeng/tooltip';
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
    MessageModule,
    TooltipModule
  ],
  template: `
    <!-- Breadcrumb -->
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" styleClass="mb-4 surface-card border-round-lg"></p-breadcrumb>

    @if (isLoading()) {
      <!-- Loading Skeleton -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <p-skeleton width="100%" height="400px" styleClass="border-round-lg"></p-skeleton>
          <div class="flex gap-2 mt-3">
            @for (i of [1,2,3,4]; track i) {
              <p-skeleton width="64px" height="64px" styleClass="border-round"></p-skeleton>
            }
          </div>
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
      <div class="grid animate-fade-in">
        <!-- Product Images -->
        <div class="col-12 md:col-6 lg:col-5">
          <div class="surface-card border-round-xl p-4 shadow-1">
            <!-- Main Image -->
            <div class="relative overflow-hidden border-round-lg product-gallery-main" style="height: 400px;">
              <div class="w-full h-full flex align-items-center justify-content-center surface-100">
                <i class="pi pi-box text-8xl text-300"></i>
              </div>
              
              <!-- Discount Badge -->
              @if (product()!.price > 50) {
                <div class="absolute bg-red-500 text-white font-bold px-3 py-1 border-round-xl text-sm shadow-2"
                     style="top: 16px; right: 16px;">
                  -20% OFF
                </div>
              }
              
              <!-- Wishlist Button -->
              <button type="button" 
                      class="absolute p-button p-button-rounded p-button-text wishlist-btn"
                      [class.active]="isWishlisted()"
                      style="top: 16px; left: 16px; background: rgba(255,255,255,0.9);"
                      (click)="toggleWishlist()"
                      pTooltip="Add to wishlist">
                <i [class]="isWishlisted() ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                   class="text-xl"></i>
              </button>
            </div>
            
            <!-- Thumbnail Gallery -->
            <div class="product-thumbnails mt-3">
              @for (i of [1,2,3,4]; track i) {
                <div class="product-thumbnail surface-100 flex align-items-center justify-content-center"
                     [class.active]="selectedImage() === i"
                     (click)="selectedImage.set(i)">
                  <i class="pi pi-image text-400"></i>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-12 md:col-6 lg:col-7">
          <div class="pl-0 md:pl-4">
            <!-- SKU -->
            <span class="text-500 text-sm font-mono">SKU: {{ product()!.sku }}</span>
            
            <!-- Title -->
            <h1 class="text-3xl font-bold text-900 m-0 mt-2 mb-3">{{ product()!.name }}</h1>
            
            <!-- Rating (Placeholder) -->
            <div class="flex align-items-center gap-2 mb-4">
              <div class="flex gap-1">
                @for (star of [1,2,3,4,5]; track star) {
                  <i class="pi" [class]="star <= 4 ? 'pi-star-fill text-yellow-500' : 'pi-star text-300'"></i>
                }
              </div>
              <span class="text-500 text-sm">(128 reviews)</span>
            </div>
            
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
                <p-tag value="Save 20%" severity="danger" styleClass="text-xs"></p-tag>
              }
            </div>
            
            <p-divider></p-divider>
            
            <!-- Quantity & Actions -->
            <div class="flex align-items-end gap-3 mt-4 flex-wrap">
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
              
              <p-button label="Buy Now" severity="secondary" size="large"
                        [disabled]="product()!.stockQuantity === 0"
                        (onClick)="buyNow()"></p-button>
            </div>
            
            @if (addedMessage()) {
              <p-message severity="success" [text]="addedMessage()!" styleClass="mt-4 w-full"></p-message>
            }
            
            <!-- Features -->
            <div class="grid mt-5 surface-50 border-round-lg p-3">
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
    .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
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
  readonly isWishlisted = signal(false);
  readonly selectedImage = signal(1);

  quantity = 1;

  readonly homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems: MenuItem[] = [
    { label: 'Products', routerLink: '/' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.isLoading.set(true);
    this.catalog.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.breadcrumbItems = [
          { label: 'Products', routerLink: '/' },
          { label: product.name }
        ];
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  toggleWishlist() {
    this.isWishlisted.update(v => !v);
  }

  async addToCart() {
    if (!this.product()) return;

    this.isAdding.set(true);
    await this.cartStore.addItem(this.product()!, this.quantity);
    this.isAdding.set(false);

    this.addedMessage.set(`Added ${this.quantity} item(s) to cart!`);
    setTimeout(() => this.addedMessage.set(null), 3000);
  }

  buyNow() {
    if (!this.product()) return;
    this.addToCart().then(() => {
      this.router.navigate(['/checkout']);
    });
  }
}
