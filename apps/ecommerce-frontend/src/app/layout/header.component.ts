import { Component, inject, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CatalogService, Category } from '../features/catalog/catalog.service';
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
import { Drawer } from 'primeng/drawer';

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
        BadgeModule,
        Drawer
    ],
    template: `
    <!-- Main Header -->
    <div class="surface-900 text-white sticky top-0 z-50 shadow-2">
        <div class="container py-2 flex flex-column md:flex-row align-items-center gap-3">
             <!-- Brand -->
             <div class="flex align-items-center gap-1 cursor-pointer" routerLink="/" (click)="clearFilters()">
                 <span class="font-bold text-2xl tracking-tight">eshuppin</span>
                 <span class="text-xs text-primary-400 align-self-end mb-1">.com</span>
             </div>

             <!-- Search Bar (Grouped) -->
             <div class="flex-grow-1 w-full md:w-auto relative">
                 <div class="flex border-round-sm overflow-hidden h-3rem shadow-1 focus-within:shadow-orange">
                     <!-- Category Dropdown -->
                     <button class="bg-gray-100 border-none text-700 px-3 text-sm cursor-pointer hover:bg-gray-200 border-right-1 border-gray-300 md:block hidden"
                             (click)="categoryMenu.toggle($event)">
                         {{ selectedCategoryName() }}
                         <i class="pi pi-caret-down text-xs ml-1"></i>
                     </button>
                     <p-menu #categoryMenu [model]="categoryMenuItems()" [popup]="true" appendTo="body"></p-menu>
                     
                     <!-- Input -->
                     <input type="text" 
                           [ngModel]="searchQuery()"
                           (ngModelChange)="searchQuery.set($event)"
                           (keyup.enter)="onSearchEnter()"
                           placeholder="Search Esborrat"
                           class="flex-grow-1 border-none px-3 text-900 outline-none"
                           aria-label="Search"
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
                 
                 <!-- Theme Toggle -->
                 <button type="button" 
                         class="flex align-items-center cursor-pointer hover:text-orange-400 p-2 border-round hover:surface-700 transition-colors bg-transparent border-none text-white"
                         [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
                         (click)="toggleTheme()">
                     <i [class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-xl"></i>
                 </button>

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

                 <!-- Wishlist -->
                 <a routerLink="/wishlist" class="flex align-items-center cursor-pointer text-white no-underline hover:text-orange-400 relative p-2 border-round transition-colors">
                    <i class="pi pi-heart text-xl"></i>
                    @if (wishlistStore.count() > 0) {
                        <span class="absolute bg-orange-500 text-white border-circle text-xs font-bold flex align-items-center justify-content-center" 
                              style="top: 2px; right: 2px; min-width: 16px; height: 16px; font-size: 10px;">{{ wishlistStore.count() }}</span>
                    }
                 </a>

                 <!-- Cart -->
                 <a routerLink="/cart" class="flex align-items-center gap-2 cursor-pointer text-white no-underline hover:text-orange-400 p-2 border-round transition-colors">
                    <span class="relative">
                        <i class="pi pi-shopping-cart text-xl"></i>
                        @if (cartStore.itemCount() > 0) {
                            <span class="absolute bg-orange-500 text-white border-circle text-xs font-bold flex align-items-center justify-content-center" 
                                  style="top: -6px; right: -8px; min-width: 16px; height: 16px; font-size: 10px;">{{ cartStore.itemCount() }}</span>
                        }
                    </span>
                    <span class="text-sm font-bold">Cart</span>
                 </a>
             </div>
        </div>
        
        <!-- Sub-nav -->
        <div class="surface-800 text-white text-sm py-2 px-3 flex gap-4 overflow-x-auto">
            <button type="button" class="flex align-items-center gap-1 font-bold hover:text-white text-gray-100 bg-transparent border-none cursor-pointer text-sm"
                    (click)="sidebarVisible.set(true)">
                <i class="pi pi-bars"></i> All
            </button>
            <a routerLink="/products" class="text-white no-underline hover:underline hover:text-orange-200">Today's Deals</a>
            <button type="button" class="text-white bg-transparent border-none cursor-pointer text-sm hover:underline hover:text-orange-200">Customer Service</button>
            <button type="button" class="text-white bg-transparent border-none cursor-pointer text-sm hover:underline hover:text-orange-200">Registry</button>
            <button type="button" class="text-white bg-transparent border-none cursor-pointer text-sm hover:underline hover:text-orange-200">Gift Cards</button>
            <button type="button" class="text-white bg-transparent border-none cursor-pointer text-sm hover:underline hover:text-orange-200">Sell</button>
        </div>
    </div>

    <!-- Category Sidebar -->
    <p-drawer [(visible)]="sidebarVisible" [modal]="true" styleClass="w-20rem">
        <ng-template pTemplate="header">
            <span class="font-bold text-xl">Shop by Category</span>
        </ng-template>
        <div class="flex flex-column gap-2 mt-3">
            <button class="text-left p-3 border-round hover:surface-200 cursor-pointer border-none bg-transparent text-900 font-semibold"
                    [class.surface-200]="!catalog.state.selectedCategory()"
                    (click)="selectCategory(null)">
                <i class="pi pi-th-large mr-2"></i> All Categories
            </button>
            @for (cat of catalog.categories(); track cat.id) {
                <button class="text-left p-3 border-round hover:surface-200 cursor-pointer border-none bg-transparent text-900"
                        [class.surface-200]="catalog.state.selectedCategory() === cat.id"
                        (click)="selectCategory(cat.id)">
                    <i class="pi pi-tag mr-2"></i> {{ cat.name }}
                </button>
            }
        </div>
    </p-drawer>
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
    readonly searchQuery = signal('');
    readonly sidebarVisible = signal(false);
    private readonly platformId = inject(PLATFORM_ID);

    readonly userMenuItems: MenuItem[] = [
        { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
        { label: 'Orders', icon: 'pi pi-list', routerLink: '/profile' },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authStore.logout() }
    ];

    // Computed category name for dropdown button
    readonly selectedCategoryName = computed(() => {
        const catId = this.catalog.state.selectedCategory();
        if (!catId) return 'All';
        const cat = this.catalog.categories().find(c => c.id === catId);
        return cat?.name ?? 'All';
    });

    // Dynamic category menu items
    readonly categoryMenuItems = computed((): MenuItem[] => {
        const items: MenuItem[] = [
            { label: 'All', command: () => this.selectCategory(null) }
        ];
        for (const cat of this.catalog.categories()) {
            items.push({ label: cat.name, command: () => this.selectCategory(cat.id) });
        }
        return items;
    });

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const savedTheme = localStorage.getItem('theme');
            this.isDark.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
            this.applyTheme();
        }

        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        effect(() => {
            const query = this.searchQuery();
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.catalog.state.setSearch(query);
            }, 350);
        });
    }

    selectCategory(categoryId: string | null) {
        this.catalog.state.setCategory(categoryId);
        this.sidebarVisible.set(false);
        this.router.navigate(['/products']);
    }

    clearFilters() {
        this.searchQuery.set('');
        this.catalog.state.setCategory(null);
    }

    onSearchEnter() {
        this.catalog.state.setSearch(this.searchQuery());
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
