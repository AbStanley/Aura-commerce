import { Component, inject, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Article } from '../../../core/models/article.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    private articleService = inject(ArticleService);
    private authService = inject(AuthService);

    articles: Signal<Article[]> = toSignal(this.articleService.getArticles(), { initialValue: [] as Article[] });

    logout() {
        this.authService.logout();
        location.reload();
    }

    deleteArticle(id: string) {
        if (confirm('Are you sure you want to delete this article?')) {
            this.articleService.deleteArticle(id).subscribe(() => {
                location.reload();
            });
        }
    }
}
