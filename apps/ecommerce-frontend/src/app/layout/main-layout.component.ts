import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartStore } from '../features/cart/cart.store';
import { AuthStore } from '../features/auth/auth.store';
import { WishlistStore } from '../features/catalog/wishlist.store';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    RippleModule
  ],
  template: `
    <div class="layout-wrapper">
      <!-- Header -->
      <header class="layout-header surface-card shadow-1">
        <div class="container">
          <div class="flex align-items-center justify-content-between py-3">
            <!-- Logo -->
            <a routerLink="/" class="flex align-items-center gap-2 text-decoration-none">
              <div class="flex align-items-center justify-content-center bg-primary border-round" 
                   style="width: 40px; height: 40px;">
                <i class="pi pi-shopping-bag text-white text-xl"></i>
              </div>
              <span class="text-xl font-bold text-primary hidden md:inline">E-Commerce</span>
            </a>

            <!-- Navigation -->
            <nav class="flex align-items-center gap-2">
              <a routerLink="/products" class="p-button p-button-text p-button-plain hidden md:flex">
                <span class="p-button-label">Products</span>
              </a>
              
              <!-- Wishlist (New) -->
              <button type="button" class="p-button p-button-text p-button-rounded relative overflow-visible"
                      pTooltip="Wishlist" tooltipPosition="bottom">
                <i class="pi pi-heart text-xl"></i>
                @if (wishlistStore.count() > 0) {
                  <span class="cart-badge bg-primary">{{ wishlistStore.count() }}</span>
                }
              </button>
              
              <!-- Cart -->
              <a routerLink="/cart" class="p-button p-button-text p-button-rounded relative overflow-visible"
                 pTooltip="Cart" tooltipPosition="bottom">
                <i class="pi pi-shopping-cart text-xl"></i>
                @if (cartStore.itemCount() > 0) {
                  <span class="cart-badge">{{ cartStore.itemCount() }}</span>
                }
              </a>

              <!-- Dark Mode Toggle -->
              <button type="button" class="p-button p-button-text p-button-rounded"
                      (click)="toggleTheme()"
                      pTooltip="Toggle theme" tooltipPosition="bottom">
                <i [class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-xl"></i>
              </button>

              <!-- User Menu -->
              @if (authStore.isAuthenticated()) {
                <p-avatar [label]="getInitial()" 
                          shape="circle" 
                          styleClass="cursor-pointer bg-primary text-white"
                          (click)="userMenu.toggle($event)"
                          pTooltip="Account" tooltipPosition="bottom"></p-avatar>
                <p-menu #userMenu [model]="userMenuItems" [popup]="true" appendTo="body"></p-menu>
              } @else {
                <a routerLink="/login" class="p-button p-button-sm">
                  <span class="p-button-label">Sign In</span>
                </a>
              }
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="layout-main py-5">
        <div class="container">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="layout-footer surface-100 border-top-1 surface-border py-4">
        <div class="container">
          <div class="flex flex-column md:flex-row align-items-center justify-content-between gap-3">
            <span class="text-500 text-sm">© 2025 E-Commerce. Built with Angular & PrimeNG.</span>
            <div class="flex gap-3">
              <a href="#" class="text-500 hover:text-primary transition-colors transition-duration-200">
                <i class="pi pi-github text-xl"></i>
              </a>
              <a href="#" class="text-500 hover:text-primary transition-colors transition-duration-200">
                <i class="pi pi-twitter text-xl"></i>
              </a>
              <a href="#" class="text-500 hover:text-primary transition-colors transition-duration-200">
                <i class="pi pi-linkedin text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
      background-color: var(--p-surface-card-opacity, var(--p-surface-card));
    }
    .layout-main {
      flex: 1;
    }
    .cart-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--p-red-500);
      color: white;
      font-size: 0.65rem;
      font-weight: 600;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .text-decoration-none {
      text-decoration: none;
    }
  `]
})
export class MainLayoutComponent {
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);
  readonly wishlistStore = inject(WishlistStore);

  readonly isDark = signal(false);

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

  getInitial(): string {
    const email = this.authStore.userEmail();
    return email ? email.charAt(0).toUpperCase() : 'U';
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
