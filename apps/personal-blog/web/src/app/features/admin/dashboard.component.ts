import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="actions">
          <a routerLink="/admin/editor" class="btn">New Article</a>
          <button (click)="logout()" class="btn-secondary">Logout</button>
        </div>
      </header>

      <div class="card">
        <table class="articles-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (article of articles(); track article.id) {
              <tr>
                <td>{{ article.title }}</td>
                <td>{{ article.publishedDate | date:'shortDate' }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/admin/editor', article.id]" class="btn-icon">Edit</a>
                  <button (click)="deleteArticle(article.id)" class="btn-icon delete">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="empty-state">No articles yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .actions {
      display: flex;
      gap: 1rem;
    }
    .articles-table {
      width: 100%;
      border-collapse: collapse;
    }
    .articles-table th, .articles-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid var(--glass-border);
    }
    .articles-table th {
      color: var(--text-dim);
      font-weight: 600;
    }
    .actions-cell {
      display: flex;
      gap: 1rem;
    }
    .btn-icon {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
    }
    .btn-icon:hover {
      text-decoration: underline;
    }
    .delete {
      color: #ff5252;
    }
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-dim);
    }
  `]
})
export class DashboardComponent {
    private articleService = inject(ArticleService);
    private authService = inject(AuthService);

    // We need to be able to refresh the list, so we might not use toSignal directly on the service call if we want manual refresh.
    // But for simplicity, we can reload page or use a signal that triggers refetch.
    // Let's use a signal trigger.

    articles = toSignal(this.articleService.getArticles(), { initialValue: [] });

    logout() {
        this.authService.logout();
        // Router redirect handled in auth service? No, usually here.
        location.reload(); // Simple way to reset state/guards
    }

    deleteArticle(id: string) {
        if (confirm('Are you sure you want to delete this article?')) {
            this.articleService.deleteArticle(id).subscribe(() => {
                // Refresh logic would go here. For "latest tech", we might use Resource API reload() or just reload window for MVP validity.
                location.reload();
            });
        }
    }
}
