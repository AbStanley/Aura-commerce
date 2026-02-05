import { Component, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ReviewStore } from '../review.store';
import { AuthStore } from '../../auth/auth.store';

@Component({
    selector: 'app-product-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule, RatingModule, ButtonModule, InputTextModule, TooltipModule],
    template: `
    <div id="reviews-section" class="mt-6 animate-slide-up">
        <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>
        
        <div class="grid">
            <div class="col-12 md:col-4">
                <div class="surface-card p-4 border-round-xl shadow-1 text-center h-full">
                    <div class="text-6xl font-bold text-900 mb-2">{{ reviewStore.getAverageRating(productId())() | number:'1.1-1' }}</div>
                    <p-rating [ngModel]="reviewStore.getAverageRating(productId())()" [readonly]="true" styleClass="justify-content-center mb-2"></p-rating>
                    <div class="text-500 mb-4">{{ reviewStore.getReviewCount(productId())() }} Verified Reviews</div>
                    
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
                    @for (review of reviewStore.getReviews(productId())(); track review.id) {
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
  `
})
export class ProductReviewsComponent {
    readonly reviewStore = inject(ReviewStore);
    readonly authStore = inject(AuthStore);

    productId = input.required<string>();

    showReviewForm = false;
    newReview = { rating: 5, comment: '' };

    submitReview() {
        const userName = this.authStore.userEmail()?.split('@')[0] || 'Guest';
        this.reviewStore.addReview(this.productId(), this.newReview.rating, this.newReview.comment, userName);
        this.showReviewForm = false;
        this.newReview = { rating: 5, comment: '' };
    }
}
