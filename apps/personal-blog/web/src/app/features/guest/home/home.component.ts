import { Component, inject, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Article } from '../../../core/models/article.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    private articleService = inject(ArticleService);
    articles: Signal<Article[]> = toSignal(this.articleService.getArticles(), { initialValue: [] as Article[] });
}
