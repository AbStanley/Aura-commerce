import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../core/services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (article(); as article) {
        <article class="card article-full">
          <header>
            <h1>{{ article.title }}</h1>
            <p class="date">{{ article.publishedDate | date:'fullDate' }}</p>
          </header>
          <div class="content">
            {{ article.content }}
          </div>
          <footer>
            <a routerLink="/" class="btn-secondary">&larr; Back to Home</a>
          </footer>
        </article>
      } @else {
        <p>Loading article...</p>
      }
    </div>
  `,
  styles: [`
    .article-full header {
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 1rem;
    }
    .content {
      font-size: 1.1rem;
      line-height: 1.8;
      margin-bottom: 3rem;
      white-space: pre-wrap; /* Preserve line breaks */
    }
    footer {
      margin-top: 2rem;
    }
  `]
})
export class ArticleDetailComponent {
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);

  article = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => id ? this.articleService.getArticle(id) : of(null))
    ),
    { initialValue: null }
  );
}
