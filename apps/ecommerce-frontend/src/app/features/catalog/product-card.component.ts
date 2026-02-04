import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from './catalog.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <!-- Image Placeholder -->
      <div class="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        <span class="text-4xl">📦</span>
        <!-- View Transition Name applied dynamically -->
        <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div class="p-4">
        <div class="flex justify-between items-start mb-2">
           <h3 class="font-bold text-gray-900 line-clamp-1">{{ product().name }}</h3>
           <span class="text-xs font-mono text-gray-500">{{ product().sku }}</span>
        </div>
        
        <p class="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
          {{ product().description }}
        </p>
        
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-blue-600">
            {{ product().price | currency }}
          </span>
          
          <button 
            (click)="addToCart.emit(product())"
            class="bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-600 transition-colors active:scale-95">
            Add to Cart
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
}
