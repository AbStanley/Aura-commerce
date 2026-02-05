import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { WishlistStore } from './wishlist.store';
import { ProductImageService, GalleryImage } from '../../shared/services/product-image.service';
import { MenuItem, MessageService } from 'primeng/api';

// PrimeNG & Sub-components
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ProductGalleryComponent } from './components/product-gallery.component';
import { ProductInfoComponent } from './components/product-info.component';
import { ProductReviewsComponent } from './components/product-reviews.component';
import { TrustBadgesComponent } from './components/trust-badges.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule, RouterLink, BreadcrumbModule, SkeletonModule,
    ToastModule, ProductGalleryComponent, ProductInfoComponent,
    ProductReviewsComponent, TrustBadgesComponent
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" styleClass="mb-4 surface-card border-round-lg shadow-1"></p-breadcrumb>

    @if (isLoading()) {
      <div class="grid">
        <div class="col-12 md:col-6">
          <p-skeleton width="100%" height="450px" styleClass="border-round-lg shadow-1"></p-skeleton>
        </div>
        <div class="col-12 md:col-6">
          <div class="pl-0 md:pl-4">
            <p-skeleton width="30%" height="1rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="80%" height="3rem" styleClass="mb-3"></p-skeleton>
            <p-skeleton width="100%" height="6rem" styleClass="mb-4"></p-skeleton>
            <p-skeleton width="40%" height="3rem" styleClass="mb-5"></p-skeleton>
          </div>
        </div>
      </div>
    } @else if (product(); as p) {
      <div class="grid animate-fade-in">
        <div class="col-12 md:col-6 lg:col-6">
          <app-product-gallery [images]="images()"></app-product-gallery>
        </div>

        <div class="col-12 md:col-6 lg:col-6">
          <app-product-info 
            [product]="p" 
            [isWishlisted]="isWishlisted()"
            [isAdding]="isAdding()"
            (toggleWishlist)="toggleWishlist(p)"
            (scrollToReviews)="scrollToReviews()"
            (addToCart)="addToCart(p, $event)"
            (buyNow)="buyNow(p, $event)"></app-product-info>
          <app-trust-badges></app-trust-badges>
        </div>
      </div>
      
      <app-product-reviews [productId]="p.id"></app-product-reviews>
    } @else {
      <div class="surface-card border-round-lg p-6 shadow-1 text-center">
        <i class="pi pi-exclamation-circle text-6xl text-300 mb-3 block"></i>
        <h3 class="text-xl font-semibold text-900 mb-2">Product not found</h3>
        <p class="text-500 mb-4">The product you're looking for doesn't exist.</p>
        <a routerLink="/" pButton label="Back to Products" icon="pi pi-arrow-left"></a>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly cartStore = inject(CartStore);
  private readonly msgService = inject(MessageService);
  private readonly imageService = inject(ProductImageService);
  readonly wishlistStore = inject(WishlistStore);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly isAdding = signal(false);
  readonly images = signal<GalleryImage[]>([]);

  readonly homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems: MenuItem[] = [{ label: 'Products', routerLink: '/' }];

  isWishlisted = computed(() => {
    const p = this.product();
    return p ? this.wishlistStore.hasItem(p.id)() : false;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  loadProduct(id: string) {
    this.isLoading.set(true);
    this.catalog.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.images.set(this.imageService.getImages(product.id, product.name));
        this.breadcrumbItems = [{ label: 'Products', routerLink: '/' }, { label: product.name }];
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  async toggleWishlist(p: Product) {
    const added = await this.wishlistStore.toggleItem({
      id: p.id, name: p.name, price: p.price,
      imageUrl: this.images()[0]?.itemImageSrc
    });
    this.msgService.add({
      severity: added ? 'success' : 'info',
      summary: added ? 'Added to Wishlist' : 'Removed from Wishlist',
      detail: added ? `${p.name} added to favorites` : `${p.name} removed from favorites`
    });
  }

  async addToCart(p: Product, quantity: number) {
    this.isAdding.set(true);
    await this.cartStore.addItem(p, quantity);
    this.isAdding.set(false);
    this.msgService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `Added ${quantity} x ${p.name}`
    });
  }

  buyNow(p: Product, quantity: number) {
    this.addToCart(p, quantity).then(() => this.router.navigate(['/checkout']));
  }

  scrollToReviews() {
    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}
