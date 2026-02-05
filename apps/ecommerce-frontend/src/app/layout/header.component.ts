import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CatalogService } from '../features/catalog/catalog.service';
import { CartStore } from '../features/cart/cart.store';
import { AuthStore } from '../features/auth/auth.store';
import { WishlistStore } from '../features/catalog/wishlist.store';

// PrimeNG Components
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        MenuModule,
        AvatarModule,
        ButtonModule,
        TooltipModule,
        BadgeModule
    ],
    template: `
    <!-- Main Header -->
    <div class="surface-900 text-white sticky top-0 z-50 shadow-2">
        <div class="container py-2 flex flex-column md:flex-row align-items-center gap-3">
             <!-- Brand -->
             <div class="flex align-items-center gap-1 cursor-pointer" routerLink="/">
                 <span class="font-bold text-2xl tracking-tight">eshuppin</span>
                 <span class="text-xs text-primary-400 align-self-end mb-1">.com</span>
             </div>

             <!-- Search Bar (Grouped) -->
             <div class="flex-grow-1 w-full md:w-auto relative">
                 <div class="flex border-round-sm overflow-hidden h-3rem shadow-1 focus-within:shadow-orange">
                     <!-- Category Dropdown (Mock-Functional) -->
                     <button class="bg-gray-100 border-none text-700 px-3 text-sm cursor-pointer hover:bg-gray-200 border-right-1 border-gray-300 md:block hidden">
                         All
                         <i class="pi pi-caret-down text-xs ml-1"></i>
                     </button>
                     
                     <!-- Input -->
                     <input type="text" 
                           [(ngModel)]="searchQuery"
                           (input)="onSearch()"
                           (keyup.enter)="onSearchEnter()"
                           placeholder="Search Esborrat"
                           class="flex-grow-1 border-none px-3 text-900 outline-none"
                           style="font-size: 1rem;" />

                     <!-- Search Button -->
                     <button class="bg-orange-400 border-none text-white px-4 hover:bg-orange-500 cursor-pointer transition-colors"
                             (click)="onSearchEnter()">
                         <i class="pi pi-search text-xl font-bold text-900"></i>
                     </button>
                 </div>
             </div>

             <!-- Nav Links -->
             <div class="flex align-items-center gap-4 text-sm font-bold white-space-nowrap md:flex hidden">
                 
                 <!-- Language / Theme (Simplified) -->
                 <div class="flex align-items-center cursor-pointer hover:text-orange-400 p-2 border-round hover:surface-700 transition-colors" (click)="toggleTheme()">
                     <i [class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-xl"></i>
                 </div>

                 <!-- Account -->
                 <div class="flex flex-column cursor-pointer hover:text-orange-400 border-1 border-transparent hover:border-gray-500 p-1 border-round transition-colors"
                      (click)="authStore.isAuthenticated() ? userMenu.toggle($event) : navigateToLogin()">
                     <span class="font-normal text-xs text-gray-300">
                        {{ authStore.isAuthenticated() ? 'Hello, ' + (authStore.userEmail() | slice:0:6) + '...' : 'Hello, Sign in' }}
                     </span>
                     <span class="flex align-items-center gap-1">Account & Lists <i class="pi pi-caret-down text-xs"></i></span>
                 </div>
                 <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body"></p-menu>

                 <!-- Returns / Orders -->
                 <a routerLink="/profile" class="flex flex-column cursor-pointer text-white no-underline hover:text-orange-400 border-1 border-transparent hover:border-gray-500 p-1 border-round transition-colors">
                     <span class="font-normal text-xs text-gray-300">Returns</span>
                     <span>& Orders</span>
                 </a>

                 <!-- Wishlist (Added) -->
                 <a routerLink="/wishlist" class="flex flex-column align-items-center cursor-pointer text-white no-underline hover:text-orange-400 relative border-1 border-transparent hover:border-gray-500 p-1 border-round transition-colors">
                     <span class="font-normal text-xs text-gray-300 align-self-start">Wishlist</span>
                     <span class="text-xl relative">
                        <span class="font-bold">List</span>
                        @if (wishlistStore.count() > 0) {
                            <span class="absolute top-0 right-0 bg-primary text-white border-circle text-xs flex align-items-center justify-content-center" 
                                  style="transform: translate(110%, -50%); width: 1.2rem; height: 1.2rem;">{{ wishlistStore.count() }}</span>
                        }
                     </span>
                 </a>

                 <!-- Cart -->
                 <a routerLink="/cart" class="flex align-items-end font-bold cursor-pointer text-white no-underline hover:text-orange-400 border-1 border-transparent hover:border-gray-500 p-1 border-round transition-colors">
                     <div class="relative mr-1">
                        <i class="pi pi-shopping-cart text-4xl"></i>
                        @if (cartStore.itemCount() > 0) {
                            <span class="absolute text-orange-400 font-bold text-lg" style="top: -8px; left: 50%; transform: translateX(-50%);">{{ cartStore.itemCount() }}</span>
                        }
                     </div>
                     <span class="mb-1 text-sm">Cart</span>
                 </a>
             </div>
        </div>
        
        <!-- Sub-nav -->
        <div class="surface-800 text-white text-sm py-2 px-3 flex gap-4 overflow-x-auto">
            <div class="flex align-items-center gap-1 font-bold cursor-pointer hover:text-white text-gray-100">
                <i class="pi pi-bars"></i> All
            </div>
            <a routerLink="/products" class="text-white no-underline hover:underline hover:text-orange-200">Today's Deals</a>
            <a href="#" class="text-white no-underline hover:underline hover:text-orange-200">Customer Service</a>
            <a href="#" class="text-white no-underline hover:underline hover:text-orange-200">Registry</a>
            <a href="#" class="text-white no-underline hover:underline hover:text-orange-200">Gift Cards</a>
            <a href="#" class="text-white no-underline hover:underline hover:text-orange-200">Sell</a>
        </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
    .focus-within\\:shadow-orange:focus-within {
        box-shadow: 0 0 0 3px #f90;
    }
  `]
})
export class HeaderComponent {
    readonly catalog = inject(CatalogService);
    readonly cartStore = inject(CartStore);
    readonly authStore = inject(AuthStore);
    readonly wishlistStore = inject(WishlistStore);
    private readonly router = inject(Router);

    readonly isDark = signal(false);
    searchQuery = '';
    private searchTimeout: any;

    readonly userMenuItems: MenuItem[] = [
        { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
        { label: 'Orders', icon: 'pi pi-list', routerLink: '/profile' },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authStore.logout() }
    ];

    constructor() {
        if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedTheme = localStorage.getItem('theme');
            this.isDark.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
            this.applyTheme();
        }
    }

    onSearch() {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.catalog.state.setSearch(this.searchQuery);
        }, 300);
    }

    onSearchEnter() {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.catalog.state.setSearch(this.searchQuery);
        // Be explicit about navigation
        this.router.navigate(['/products']);
    }

    navigateToLogin() {
        this.router.navigate(['/login']);
    }

    toggleTheme() {
        this.isDark.update(d => !d);
        this.applyTheme();
    }

    private applyTheme() {
        if (typeof document !== 'undefined') {
            const html = document.documentElement;
            if (this.isDark()) {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }
}
