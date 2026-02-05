import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../shared/models/product.model';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ReviewStore } from '../review.store';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-product-info',
    standalone: true,
    imports: [CommonModule, FormsModule, TagModule, RatingModule, InputNumberModule, ButtonModule, DividerModule, TooltipModule],
    template: `
    <div class="pl-0 md:pl-4">
        <div class="flex align-items-center justify-content-between">
            <span class="text-500 text-sm font-mono bg-primary-50 px-2 py-1 border-round">SKU: {{ product().sku }}</span>
            
            <button pButton 
                    [icon]="isWishlisted() ? 'pi pi-heart-fill' : 'pi pi-heart'" 
                    [class]="isWishlisted() ? 'p-button-danger' : 'p-button-outlined p-button-secondary'"
                    [rounded]="true" 
                    pTooltip="Add to Wishlist"
                    (click)="toggleWishlist.emit()"></button>
        </div>
        
        <h1 class="text-4xl font-bold text-900 m-0 mt-3 mb-2">{{ product().name }}</h1>
        
        <div class="flex align-items-center gap-3 mb-4 cursor-pointer hover:surface-100 p-2 border-round transition-colors transition-duration-200 w-max" (click)="scrollToReviews.emit()">
            <p-rating [ngModel]="reviewStore.getAverageRating(product().id)()" [readonly]="true" [stars]="5"></p-rating>
            <span class="text-primary font-medium hover:underline">{{ reviewStore.getReviewCount(product().id)() }} reviews</span>
        </div>
        
        <div class="surface-50 p-3 border-round-lg mb-4 flex align-items-center gap-3">
            <span class="text-5xl font-bold text-primary">{{ product().price | currency }}</span>
            @if (product().price > 50) {
                <div class="flex flex-column">
                    <span class="text-xl line-through text-500">{{ product().price * 1.25 | currency }}</span>
                    <p-tag value="SAVE 20%" severity="success" styleClass="text-xs font-bold"></p-tag>
                </div>
            }
        </div>

        <p class="text-700 line-height-3 mb-5 text-lg">{{ product().description }}</p>
        
        <div class="flex align-items-center gap-2 mb-5">
            @if (product().stockQuantity > 10) {
                <div class="flex align-items-center gap-2 text-green-600 bg-green-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-check-circle text-xl"></i>
                    <span>In Stock & Ready to Ship</span>
                </div>
            } @else if (product().stockQuantity > 0) {
                <div class="flex align-items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-exclamation-triangle text-xl"></i>
                    <span>Low Stock - Only {{ product().stockQuantity }} left!</span>
                </div>
            } @else {
                <div class="flex align-items-center gap-2 text-red-600 bg-red-50 px-3 py-2 border-round font-medium">
                    <i class="pi pi-times-circle text-xl"></i>
                    <span>Currently Out of Stock</span>
                </div>
            }
        </div>
        
        <p-divider></p-divider>
        
        <div class="flex align-items-end gap-3 mt-4 flex-wrap">
            <div class="flex flex-column gap-2">
            <label class="text-600 font-semibold">Quantity</label>
            <p-inputNumber [(ngModel)]="quantity" 
                            [showButtons]="true" 
                            buttonLayout="horizontal"
                            [min]="1" 
                            [max]="product().stockQuantity"
                            decrementButtonClass="p-button-secondary p-button-outlined"
                            incrementButtonClass="p-button-secondary p-button-outlined"
                            inputStyleClass="w-3rem text-center font-bold"></p-inputNumber>
            </div>
            
            <p-button label="Add to Cart" icon="pi pi-shopping-cart" size="large"
                    [loading]="isAdding()"
                    [disabled]="!product() || !product().stockQuantity || product().stockQuantity <= 0"
                    styleClass="w-full sm:w-auto px-5"
                    (onClick)="addToCart.emit(quantity)"></p-button>
            
            <p-button label="Buy Now" icon="pi pi-bolt" severity="secondary" size="large"
                    [disabled]="!product() || !product().stockQuantity || product().stockQuantity <= 0"
                    styleClass="w-full sm:w-auto px-5"
                    (onClick)="buyNow.emit(quantity)"></p-button>
        </div>
    </div>
  `,
    styles: [`.w-max { width: max-content; }`]
})
export class ProductInfoComponent {
    readonly reviewStore = inject(ReviewStore);

    product = input.required<Product>();
    isWishlisted = input<boolean>(false);
    isAdding = input<boolean>(false);

    toggleWishlist = output();
    scrollToReviews = output();
    addToCart = output<number>();
    buyNow = output<number>();

    quantity = 1;
}
