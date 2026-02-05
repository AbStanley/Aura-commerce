import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-trust-badges',
    standalone: true,
    imports: [CommonModule],
    template: `
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
  `
})
export class TrustBadgesComponent { }
