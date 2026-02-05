import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent
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

      <app-footer></app-footer>
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
