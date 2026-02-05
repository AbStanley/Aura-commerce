import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink],
    template: `
    <footer class="surface-900 text-white py-5 mt-auto">
        <div class="container">
            <div class="grid">
                <!-- Brand / About -->
                <div class="col-12 md:col-4 mb-4 md:mb-0">
                    <div class="flex align-items-center gap-1 mb-3">
                        <span class="font-bold text-xl">eshuppin</span>
                        <span class="text-xs text-primary-400">.com</span>
                    </div>
                    <p class="text-gray-400 text-sm line-height-3 m-0">
                        Your one-stop shop for quality products. Fast shipping, secure payments, and excellent customer service.
                    </p>
                </div>
                
                <!-- Quick Links -->
                <div class="col-6 md:col-2">
                    <h4 class="text-sm font-bold text-gray-300 uppercase mb-3">Shop</h4>
                    <ul class="list-none p-0 m-0 flex flex-column gap-2">
                        <li><a routerLink="/" class="text-gray-400 no-underline hover:text-white text-sm">All Products</a></li>
                        <li><a routerLink="/products" class="text-gray-400 no-underline hover:text-white text-sm">Today's Deals</a></li>
                    </ul>
                </div>
                
                <!-- Account -->
                <div class="col-6 md:col-2">
                    <h4 class="text-sm font-bold text-gray-300 uppercase mb-3">Account</h4>
                    <ul class="list-none p-0 m-0 flex flex-column gap-2">
                        <li><a routerLink="/profile" class="text-gray-400 no-underline hover:text-white text-sm">My Profile</a></li>
                        <li><a routerLink="/cart" class="text-gray-400 no-underline hover:text-white text-sm">Cart</a></li>
                        <li><a routerLink="/wishlist" class="text-gray-400 no-underline hover:text-white text-sm">Wishlist</a></li>
                    </ul>
                </div>
                
                <!-- Social / Legal -->
                <div class="col-12 md:col-4 mt-4 md:mt-0 text-center md:text-right">
                    <div class="flex gap-3 justify-content-center md:justify-content-end mb-3">
                        <button type="button" class="text-gray-400 hover:text-white text-xl bg-transparent border-none cursor-pointer" aria-label="Facebook"><i class="pi pi-facebook"></i></button>
                        <button type="button" class="text-gray-400 hover:text-white text-xl bg-transparent border-none cursor-pointer" aria-label="Twitter"><i class="pi pi-twitter"></i></button>
                        <button type="button" class="text-gray-400 hover:text-white text-xl bg-transparent border-none cursor-pointer" aria-label="Instagram"><i class="pi pi-instagram"></i></button>
                        <button type="button" class="text-gray-400 hover:text-white text-xl bg-transparent border-none cursor-pointer" aria-label="GitHub"><i class="pi pi-github"></i></button>
                    </div>
                    <p class="text-gray-500 text-xs m-0">
                        © {{ currentYear }} eshuppin.com. All rights reserved.
                    </p>
                    <p class="text-gray-600 text-xs m-0 mt-1">
                        Demo Project for Showcase
                    </p>
                </div>
            </div>
        </div>
    </footer>
    `,
    styles: [`
        :host { display: block; }
        footer { border-top: 1px solid rgba(255,255,255,0.1); }
    `]
})
export class FooterComponent {
    readonly currentYear = new Date().getFullYear();
}
