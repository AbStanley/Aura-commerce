import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../../core/services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, ParamMap } from '@angular/router';
import { map, switchMap, of } from 'rxjs';
import { Article } from '../../../core/models/article.model';

@Component({
    selector: 'app-article-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './article-detail.component.html',
    styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent {
    private articleService = inject(ArticleService);
    private route = inject(ActivatedRoute);

    article = toSignal<Article | null>(
        this.route.paramMap.pipe(
            map((params: ParamMap) => params.get('id')),
            switchMap((id: string | null) => id ? this.articleService.getArticle(id) : of(null))
        ),
        { initialValue: null }
    );
}
