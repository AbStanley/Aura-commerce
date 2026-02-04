import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { CartStore } from '../cart/cart.store';
import { WishlistStore } from './wishlist.store';
import { ReviewStore } from './review.store';
import { GalleryAdapterService, GalleryImage } from './gallery-adapter.service';
import { AuthStore } from '../../features/auth/auth.store';
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
import { GalleriaModule } from 'primeng/galleria';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    TooltipModule,
    GalleriaModule,
    RatingModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <!-- Breadcrumb -->
    <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" styleClass="mb-4 surface-card border-round-lg shadow-1"></p-breadcrumb>

    @if (isLoading()) {
      <!-- Loading Skeleton -->
      <div class="grid">
        <div class="col-12 md:col-6">
          <p-skeleton width="100%" height="450px" styleClass="border-round-lg shadow-1"></p-skeleton>
          <div class="flex gap-2 mt-3">
            @for (i of [1,2,3,4]; track i) {
              <p-skeleton width="80px" height="80px" styleClass="border-round"></p-skeleton>
            }
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="pl-0 md:pl-4">
            <p-skeleton width="30%" height="1rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="80%" height="3rem" styleClass="mb-3"></p-skeleton>
            <div class="flex gap-2 mb-4">
                <p-skeleton width="100px" height="1.5rem"></p-skeleton>
                <p-skeleton width="80px" height="1.5rem"></p-skeleton>
            </div>
            <p-skeleton width="100%" height="6rem" styleClass="mb-4 text-justify"></p-skeleton>
            <p-skeleton width="40%" height="3rem" styleClass="mb-5"></p-skeleton>
            <div class="flex gap-3">
              <p-skeleton width="150px" height="3.5rem" styleClass="border-round"></p-skeleton>
              <p-skeleton width="150px" height="3.5rem" styleClass="border-round"></p-skeleton>
            </div>
          </div>
        </div>
      </div>
    } @else if (product()) {
      <div class="grid animate-fade-in">
        <!-- Product Gallery -->
        <div class="col-12 md:col-6 lg:col-6">
          <div class="card shadow-1 border-round-xl overflow-hidden surface-card">
             <p-galleria [value]="images()" [(activeIndex)]="activeIndex" [numVisible]="4" [circular]="true" 
                        [showItemNavigators]="true" [showThumbnails]="true" [responsiveOptions]="responsiveOptions"
                        [containerStyle]="{'max-width': '100%'}">
                <ng-template pTemplate="item" let-item>
                    <img [src]="item.itemImageSrc" [alt]="item.alt" style="width: 100%; display: block; height: 500px; object-fit: cover; border-radius: 12px;" />
                </ng-template>
                <ng-template pTemplate="thumbnail" let-item>
                    <div class="grid grid-nogutter justify-content-center p-1">
                        <img [src]="item.thumbnailImageSrc" [alt]="item.alt" 
                             style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer;" 
                             class="hover:surface-300 transition-colors transition-duration-200" />
                    </div>
                </ng-template>
            </p-galleria>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-12 md:col-6 lg:col-6">
          <div class="pl-0 md:pl-4">
             <div class="flex align-items-center justify-content-between">
                <span class="text-500 text-sm font-mono bg-primary-50 px-2 py-1 border-round">SKU: {{ product()!.sku }}</span>
                
                <!-- Wishlist Toggle -->
                <button pButton 
                        [icon]="isWishlisted() ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                        [class]="isWishlisted() ? 'p-button-danger' : 'p-button-outlined p-button-secondary'"
                        [rounded]="true" 
                        pTooltip="Add to Wishlist"
                        (click)="toggleWishlist()"></button>
             </div>
            
            <!-- Title -->
            <h1 class="text-4xl font-bold text-900 m-0 mt-3 mb-2">{{ product()!.name }}</h1>
            
            <!-- Ratings -->
            <div class="flex align-items-center gap-3 mb-4 cursor-pointer hover:surface-100 p-2 border-round transition-colors transition-duration-200 w-max" (click)="scrollToReviews()">
              <p-rating [ngModel]="reviewStore.getAverageRating(product()!.id)()" [readonly]="true" [stars]="5"></p-rating>
              <span class="text-primary font-medium hover:underline">{{ reviewStore.getReviewCount(product()!.id)() }} reviews</span>
            </div>
            
            <!-- Price Block -->
             <div class="surface-50 p-3 border-round-lg mb-4 flex align-items-center gap-3">
                <span class="text-5xl font-bold text-primary">{{ product()!.price | currency }}</span>
                @if (product()!.price > 50) {
                    <div class="flex flex-column">
                        <span class="text-xl line-through text-500">{{ product()!.price * 1.25 | currency }}</span>
                        <p-tag value="SAVE 20%" severity="success" styleClass="text-xs font-bold"></p-tag>
                    </div>
                }
             </div>

            <!-- Description -->
            <p class="text-700 line-height-3 mb-5 text-lg">{{ product()!.description }}</p>
            
            <!-- Stock Status -->
            <div class="flex align-items-center gap-2 mb-5">
              @if (product()!.stockQuantity > 10) {
                <div class="flex align-items-center gap-2 text-green-600 bg-green-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-check-circle text-xl"></i>
                    <span>In Stock & Ready to Ship</span>
                </div>
              } @else if (product()!.stockQuantity > 0) {
                 <div class="flex align-items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-exclamation-triangle text-xl"></i>
                    <span>Low Stock - Only {{ product()!.stockQuantity }} left!</span>
                </div>
              } @else {
                 <div class="flex align-items-center gap-2 text-red-600 bg-red-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-times-circle text-xl"></i>
                    <span>Currently Out of Stock</span>
                </div>
              }
            </div>
            
            <p-divider></p-divider>
            
            <!-- Actions -->
            <div class="flex align-items-end gap-3 mt-4 flex-wrap">
              <div class="flex flex-column gap-2">
                <label class="text-600 font-semibold">Quantity</label>
                <p-inputNumber [(ngModel)]="quantity" 
                               [showButtons]="true" 
                               buttonLayout="horizontal"
                               [min]="1" 
                               [max]="product()!.stockQuantity"
                               decrementButtonClass="p-button-secondary p-button-outlined"
                               incrementButtonClass="p-button-secondary p-button-outlined"
                               inputStyleClass="w-3rem text-center font-bold"></p-inputNumber>
              </div>
              
              <p-button label="Add to Cart" icon="pi pi-shopping-cart" size="large"
                        [loading]="isAdding()"
                        [disabled]="!product() || !product()!.stockQuantity || product()!.stockQuantity <= 0"
                        styleClass="w-full sm:w-auto px-5"
                        (onClick)="addToCart()"></p-button>
              
              <p-button label="Buy Now" icon="pi pi-bolt" severity="secondary" size="large"
                        [disabled]="!product() || !product()!.stockQuantity || product()!.stockQuantity <= 0"
                        styleClass="w-full sm:w-auto px-5"
                        (onClick)="buyNow()"></p-button>
            </div>
            
            <!-- Trust Badges -->
            <div class="grid mt-5 pt-3 border-top-1 surface-border">
              <div class="col-6 md:col-3 text-center">
                  <div class="w-3rem h-3rem bg-primary-50 border-round-circle flex align-items-center justify-content-center mx-auto mb-2 text-primary">
                    <i class="pi pi-truck text-xl"></i>
                  </div>
                  <span class="text-sm font-medium text-700">Free Delivery</span>
              </div>
              <div class="col-6 md:col-3 text-center">
                  <div class="w-3rem h-3rem bg-primary-50 border-round-circle flex align-items-center justify-content-center mx-auto mb-2 text-primary">
                    <i class="pi pi-shield text-xl"></i>
                  </div>
                  <span class="text-sm font-medium text-700">Secure Payment</span>
              </div>
              <div class="col-6 md:col-3 text-center">
                  <div class="w-3rem h-3rem bg-primary-50 border-round-circle flex align-items-center justify-content-center mx-auto mb-2 text-primary">
                    <i class="pi pi-refresh text-xl"></i>
                  </div>
                  <span class="text-sm font-medium text-700">Free Returns</span>
              </div>
               <div class="col-6 md:col-3 text-center">
                  <div class="w-3rem h-3rem bg-primary-50 border-round-circle flex align-items-center justify-content-center mx-auto mb-2 text-primary">
                    <i class="pi pi-star text-xl"></i>
                  </div>
                  <span class="text-sm font-medium text-700">Top Rated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Reviews Section -->
      <div id="reviews-section" class="mt-6 animate-slide-up">
        <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>
        
        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="surface-card p-4 border-round-xl shadow-1 text-center h-full">
                    <div class="text-6xl font-bold text-900 mb-2">{{ reviewStore.getAverageRating(product()!.id)() | number:'1.1-1' }}</div>
                    <p-rating [ngModel]="reviewStore.getAverageRating(product()!.id)()" [readonly]="true" styleClass="justify-content-center mb-2"></p-rating>
                    <div class="text-500 mb-4">{{ reviewStore.getReviewCount(product()!.id)() }} Verified Reviews</div>
                    
                    <p-button label="Write a Review" icon="pi pi-pencil" [outlined]="true" (onClick)="showReviewForm = !showReviewForm"></p-button>
                </div>
            </div>
            
            <div class="col-12 md:col-8">
                <!-- Write Review Form -->
                @if (showReviewForm) {
                    <div class="surface-card p-4 border-round-xl shadow-1 mb-4 animate-fade-in border-1 border-primary-500">
                        <h3 class="text-lg font-bold mb-3">Write your review</h3>
                        
                        <div class="flex flex-column gap-3">
                             <div class="flex flex-column gap-2">
                                <label class="font-medium">Rating</label>
                                <p-rating [(ngModel)]="newReview.rating"></p-rating>
                             </div>
                             
                             <div class="flex flex-column gap-2">
                                <label class="font-medium">Your Review</label>
                                <input type="text" pInputText [(ngModel)]="newReview.comment" placeholder="What did you like or dislike? (Keep it short)" class="w-full" />
                             </div>
                             
                             <div class="flex justify-content-end gap-2">
                                <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="showReviewForm = false"></p-button>
                                <p-button label="Submit Review" (onClick)="submitReview()" [disabled]="!newReview.comment"></p-button>
                             </div>
                        </div>
                    </div>
                }

                <!-- Review List -->
                <div class="flex flex-column gap-3">
                    @for (review of reviewStore.getReviews(product()!.id)(); track review.id) {
                        <div class="surface-card p-4 border-round-xl shadow-1">
                            <div class="flex justify-content-between align-items-start mb-2">
                                <div class="flex align-items-center gap-2">
                                    <div class="w-2rem h-2rem bg-primary-100 text-primary-700 border-round-circle flex align-items-center justify-content-center font-bold">
                                        {{ review.userName.charAt(0) }}
                                    </div>
                                    <span class="font-bold text-900">{{ review.userName }}</span>
                                    @if(review.verified) {
                                        <i class="pi pi-check-circle text-green-500" pTooltip="Verified Purchase"></i>
                                    }
                                </div>
                                <span class="text-500 text-sm">{{ review.date | date }}</span>
                            </div>
                            <p-rating [ngModel]="review.rating" [readonly]="true" styleClass="mb-2 text-sm"></p-rating>
                            <p class="text-700 line-height-3 m-0">{{ review.comment }}</p>
                        </div>
                    }
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
    .w-max { width: max-content; }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly cartStore = inject(CartStore);
  private readonly msgService = inject(MessageService);
  private readonly galleryAdapter = inject(GalleryAdapterService);
  private readonly authStore = inject(AuthStore);

  // Public Stores
  readonly wishlistStore = inject(WishlistStore);
  readonly reviewStore = inject(ReviewStore);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(true);
  readonly isAdding = signal(false);
  readonly images = signal<GalleryImage[]>([]);

  // Review Form State
  showReviewForm = false;
  newReview = { rating: 5, comment: '' };

  quantity = 1;

  // Galleria Options
  activeIndex = 0;
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  readonly homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems: MenuItem[] = [
    { label: 'Products', routerLink: '/' }
  ];

  isWishlisted = computed(() => {
    const p = this.product();
    return p ? this.wishlistStore.hasItem(p.id)() : false;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.isLoading.set(true);
    // Load reviews concurrently (mock)
    this.reviewStore.loadReviews(id);

    this.catalog.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.images.set(this.galleryAdapter.getImages(product.id, product.name));
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

  async toggleWishlist() {
    const p = this.product();
    if (!p) return;

    const added = await this.wishlistStore.toggleItem({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: this.images()[0]?.itemImageSrc
    });

    this.msgService.add({
      severity: added ? 'success' : 'info',
      summary: added ? 'Added to Wishlist' : 'Removed from Wishlist',
      detail: added ? `${p.name} is now in your favorites` : `${p.name} removed from favorites`
    });
  }

  async addToCart() {
    if (!this.product()) return;
    if (!this.product()!.stockQuantity || this.product()!.stockQuantity <= 0) return;

    this.isAdding.set(true);
    await this.cartStore.addItem(this.product()!, this.quantity);
    this.isAdding.set(false);

    this.msgService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `Added ${this.quantity} x ${this.product()!.name}`
    });
  }

  buyNow() {
    if (!this.product()) return;
    this.addToCart().then(() => {
      this.router.navigate(['/checkout']);
    });
  }

  submitReview() {
    const p = this.product();
    if (!p) return;

    const userName = this.authStore.userEmail()?.split('@')[0] || 'Guest';
    this.reviewStore.addReview(p.id, this.newReview.rating, this.newReview.comment, userName);

    this.showReviewForm = false;
    this.newReview = { rating: 5, comment: '' };

    this.msgService.add({
      severity: 'success',
      summary: 'Review Submitted',
      detail: 'Thank you for your feedback!'
    });
  }

  scrollToReviews() {
    const el = document.getElementById('reviews-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
