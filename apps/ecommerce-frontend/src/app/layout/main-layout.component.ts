import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  template: `
    <div class="layout-wrapper">
      <app-header></app-header>

      <!-- Main Content -->
      <main class="layout-main pb-5">
        <div class="container">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="layout-footer surface-900 border-top-1 px-4 py-8 text-white">
        <div class="container">
          <div class="grid">
              <div class="col-12 md:col-3">
                  <span class="font-bold text-2xl tracking-tight">eshuppin</span>
              </div>
              <div class="col-12 md:col-3">
                   <h4 class="font-bold mb-3">Get to Know Us</h4>
                   <ul class="list-none p-0 m-0 line-height-3 text-gray-400">
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Careers</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">About Us</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Investor Relations</a></li>
                   </ul>
              </div>
              <div class="col-12 md:col-3">
                   <h4 class="font-bold mb-3">Make Money with Us</h4>
                   <ul class="list-none p-0 m-0 line-height-3 text-gray-400">
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Sell products on E-Commerce</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Sell on Amazon Business</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Become an Affiliate</a></li>
                   </ul>
              </div>
              <div class="col-12 md:col-3">
                   <h4 class="font-bold mb-3">Let Us Help You</h4>
                   <ul class="list-none p-0 m-0 line-height-3 text-gray-400">
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Your Account</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Your Orders</a></li>
                       <li><a class="text-white no-underline hover:underline cursor-pointer">Help</a></li>
                   </ul>
              </div>
          </div>
          <div class="border-top-1 border-gray-700 mt-6 pt-4 text-center text-gray-500 text-sm">
             © 2025 E-Commerce, Inc. or its affiliates
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
    .layout-main {
      flex: 1;
    }
  `]
})
export class MainLayoutComponent { }
