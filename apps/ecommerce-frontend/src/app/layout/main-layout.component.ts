import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../features/auth/auth.store';
import { CartStore } from '../features/cart/cart.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-foreground">
      <!-- Header with glassmorphism -->
      <header 
        class="sticky top-0 z-50 w-full border-b transition-all duration-300"
        [class]="isScrolled() ? 'glass shadow-sm' : 'bg-background/95 backdrop-blur-sm border-transparent'">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center 
                        group-hover:scale-110 transition-transform duration-200">
              <span class="text-primary-foreground font-bold text-sm">E</span>
            </div>
            <span class="text-xl font-bold gradient-text hidden sm:block">
              E-Commerce
            </span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/products" 
               class="btn btn-ghost btn-sm text-muted-foreground hover:text-foreground">
              Products
            </a>
            <a routerLink="/cart" 
               class="btn btn-ghost btn-sm text-muted-foreground hover:text-foreground relative">
              Cart
              @if (cartStore.itemCount() > 0) {
                <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground 
                             text-xs flex items-center justify-center font-medium animate-scale-in">
                  {{ cartStore.itemCount() }}
                </span>
              }
            </a>
          </nav>

          <!-- Right side actions -->
          <div class="flex items-center gap-2">
            <!-- Theme Toggle -->
            <button 
              (click)="toggleTheme()" 
              class="btn btn-ghost btn-icon"
              [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
              @if (isDark()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              }
            </button>

            <!-- Auth Status -->
            @if (authStore.isAuthenticated()) {
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted-foreground hidden lg:block">
                  {{ authStore.userEmail() }}
                </span>
                <button 
                  (click)="authStore.logout()" 
                  class="btn btn-ghost btn-sm text-destructive hover:text-destructive hover:bg-destructive/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span class="hidden sm:inline">Logout</span>
                </button>
              </div>
            } @else {
              <a routerLink="/login" class="btn btn-primary btn-sm">
                Sign In
              </a>
            }

            <!-- Mobile Menu Button -->
            <button 
              (click)="toggleMobileMenu()" 
              class="btn btn-ghost btn-icon md:hidden">
              @if (isMobileMenuOpen()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden border-t border-border animate-fade-in">
            <nav class="container mx-auto px-4 py-4 flex flex-col gap-2">
              <a routerLink="/products" (click)="closeMobileMenu()"
                 class="btn btn-ghost justify-start text-muted-foreground hover:text-foreground">
                Products
              </a>
              <a routerLink="/cart" (click)="closeMobileMenu()"
                 class="btn btn-ghost justify-start text-muted-foreground hover:text-foreground">
                Cart
                @if (cartStore.itemCount() > 0) {
                  <span class="badge badge-primary ml-auto">{{ cartStore.itemCount() }}</span>
                }
              </a>
            </nav>
          </div>
        }
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        <div class="container mx-auto px-4 py-8">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-border bg-muted/30">
        <div class="container mx-auto px-4 py-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-sm text-muted-foreground">
              © 2026 E-Commerce Platform. Built with Angular 21.
            </p>
            <div class="flex items-center gap-4">
              <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class MainLayoutComponent {
  readonly authStore = inject(AuthStore);
  readonly cartStore = inject(CartStore);

  readonly isScrolled = signal(false);
  readonly isDark = signal(false);
  readonly isMobileMenuOpen = signal(false);

  constructor() {
    // Initialize theme from localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(savedTheme === 'dark' || (!savedTheme && prefersDark));
      this.applyTheme();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 10);
    }
  }

  toggleTheme() {
    this.isDark.update(v => !v);
    this.applyTheme();
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
    }
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.isDark());
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
