import { Component, input, output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from './catalog.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <div class="card card-hover group overflow-hidden">
      <!-- Image Container -->
      <a [routerLink]="['/products', product().id]" class="block relative">
        <div class="aspect-square bg-muted flex items-center justify-center overflow-hidden">
          <!-- Placeholder Image -->
          <div class="text-6xl group-hover:scale-110 transition-transform duration-500 ease-out">
            📦
          </div>
          
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 
                      dark:group-hover:bg-white/5 transition-colors duration-300"></div>
          
          <!-- Quick View Button (appears on hover) -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300">
            <span class="btn btn-secondary btn-sm shadow-lg">
              Quick View
            </span>
          </div>
        </div>
        
        <!-- Badges -->
        @if (product().stockQuantity && product().stockQuantity < 10) {
          <div class="absolute top-3 left-3">
            <span class="badge badge-warning">Low Stock</span>
          </div>
        }
      </a>
      
      <!-- Content -->
      <div class="p-4 space-y-3">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <a [routerLink]="['/products', product().id]" 
             class="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
            {{ product().name }}
          </a>
          <span class="text-xs font-mono text-muted-foreground shrink-0">
            {{ product().sku }}
          </span>
        </div>
        
        <!-- Description -->
        <p class="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {{ product().description }}
        </p>
        
        <!-- Footer -->
        <div class="flex items-center justify-between pt-2 border-t border-border">
          <span class="text-lg font-bold text-primary">
            {{ product().price | currency }}
          </span>
          
          <button 
            (click)="handleAddToCart($event)"
            [disabled]="isAdding()"
            class="btn btn-primary btn-sm">
            @if (isAdding()) {
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            } @else if (justAdded()) {
              <svg class="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Added!
            } @else {
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Add
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();

  isAdding = signal(false);
  justAdded = signal(false);

  handleAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.isAdding.set(true);

    // Simulate a brief loading state for feedback
    setTimeout(() => {
      this.addToCart.emit(this.product());
      this.isAdding.set(false);
      this.justAdded.set(true);

      // Reset the "Added!" state after 2 seconds
      setTimeout(() => {
        this.justAdded.set(false);
      }, 2000);
    }, 300);
  }
}
