import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet],
    template: `
    <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div class="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" class="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            E-Commerce
          </a>
          <nav class="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="/products" class="hover:text-blue-600 transition-colors">Products</a>
            <a href="/cart" class="hover:text-blue-600 transition-colors">Cart</a>
          </nav>
          <div class="flex items-center gap-4">
             <!-- Auth & Cart Placeholder -->
             <button class="text-sm font-medium text-gray-600 hover:text-black">Login</button>
          </div>
        </div>
      </header>

      <main class="flex-1 container mx-auto px-4 py-8">
        <router-outlet />
      </main>

      <footer class="bg-gray-900 text-gray-400 py-12">
        <div class="container mx-auto px-4 text-center">
          <p>&copy; 2026 E-Commerce Platform. Built with Angular 21.</p>
        </div>
      </footer>
    </div>
  `,
    styles: []
})
export class MainLayoutComponent { }
