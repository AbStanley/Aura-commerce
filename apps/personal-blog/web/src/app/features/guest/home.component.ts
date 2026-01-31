import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <header class="hero">
        <h1>Welcome to My Blog</h1>
        <p>Thoughts, stories, and ideas.</p>
      </header>

      <div class="articles-grid">
        @for (article of articles(); track article.id) {
          <article class="card">
            <h2>{{ article.title }}</h2>
            <p class="date">{{ article.publishedDate | date:'mediumDate' }}</p>
            <p class="snippet">{{ article.content | slice:0:150 }}...</p>
            <a [routerLink]="['/article', article.id]" class="btn-link">Read more &rarr;</a>
          </article>
        } @empty {
          <p>No articles found.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 4rem 0;
      margin-bottom: 2rem;
    }
    .hero h1 {
      font-size: 3rem;
      background: linear-gradient(to right, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .date {
      color: var(--text-dim);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .snippet {
      margin-bottom: 1.5rem;
    }
    .btn-link {
      font-weight: 600;
      font-size: 0.9rem;
    }
  `]
})
export class HomeComponent {
  private articleService = inject(ArticleService);
  articles = toSignal(this.articleService.getArticles(), { initialValue: [] });
}
