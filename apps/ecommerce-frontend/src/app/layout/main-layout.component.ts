import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartStore } from '../features/cart/cart.store';
import { AuthStore } from '../features/auth/auth.store';

// PrimeNG Components
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MenubarModule,
    ButtonModule,
    BadgeModule,
    AvatarModule,
    MenuModule,
    DividerModule,
    TooltipModule
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="surface-0 border-bottom-1 surface-border sticky top-0 z-5">
        <div class="container flex align-items-center justify-content-between py-3">
          <!-- Logo -->
          <a routerLink="/" class="flex align-items-center gap-2 no-underline">
            <span class="bg-primary border-round p-2">
              <i class="pi pi-shopping-bag text-white text-xl"></i>
            </span>
            <span class="text-xl font-bold text-primary hidden md:inline">E-Commerce</span>
          </a>

          <!-- Navigation -->
          <nav class="flex align-items-center gap-3">
            <a routerLink="/products" pButton pRipple label="Products" 
               class="p-button-text p-button-plain hidden-mobile"></a>
            
            <!-- Cart -->
            <a routerLink="/cart" pButton pRipple 
               class="p-button-text p-button-rounded p-button-plain"
               pTooltip="Cart" tooltipPosition="bottom">
              <i class="pi pi-shopping-cart text-xl"></i>
              @if (cartStore.itemCount() > 0) {
                <p-badge [value]="cartStore.itemCount().toString()" 
                         severity="danger" 
                         class="absolute" 
                         style="top: -5px; right: -5px;"></p-badge>
              }
            </a>

            <!-- Dark Mode Toggle -->
            <button pButton pRipple 
                    class="p-button-text p-button-rounded p-button-plain"
                    (click)="toggleTheme()"
                    pTooltip="Toggle theme" tooltipPosition="bottom">
              <i [class]="isDark() ? 'pi pi-sun' : 'pi pi-moon'" class="text-xl"></i>
            </button>

            <!-- User Menu -->
            @if (authStore.isAuthenticated()) {
              <p-avatar [label]="getInitial()" 
                        shape="circle" 
                        class="cursor-pointer"
                        (click)="userMenu.toggle($event)"
                        pTooltip="Account" tooltipPosition="bottom"></p-avatar>
              <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
            } @else {
              <a routerLink="/login" pButton pRipple label="Sign In" 
                 class="p-button-sm"></a>
            }
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 py-5">
        <div class="container">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="surface-100 border-top-1 surface-border py-4 mt-auto">
        <div class="container">
          <div class="flex flex-column md:flex-row align-items-center justify-content-between gap-3">
            <span class="text-500 text-sm">© 2025 E-Commerce. Built with Angular & PrimeNG.</span>
            <div class="flex gap-3">
              <a href="#" class="text-500 hover:text-primary"><i class="pi pi-github text-xl"></i></a>
              <a href="#" class="text-500 hover:text-primary"><i class="pi pi-twitter text-xl"></i></a>
              <a href="#" class="text-500 hover:text-primary"><i class="pi pi-linkedin text-xl"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .min-h-screen { min-height: 100vh; }
    .z-5 { z-index: 1000; }
    .no-underline { text-decoration: none; }
    .cursor-pointer { cursor: pointer; }
    .hover\\:text-primary:hover { color: var(--p-primary-500); }
  `]
})
export class MainLayoutComponent {
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);

  readonly isDark = signal(false);

  readonly userMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
    { label: 'Orders', icon: 'pi pi-list', routerLink: '/profile' },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authStore.logout() }
  ];

  constructor() {
    // Check system preference on init
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
