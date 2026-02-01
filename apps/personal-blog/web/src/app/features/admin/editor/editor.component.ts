import { Component, inject, input, effect, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent {
    private fb = inject(FormBuilder);
    private articleService = inject(ArticleService);
    private router = inject(Router);

    articleForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required]
    });

    loading = false;
    id = input<string>();
    isEditing = computed(() => !!this.id());

    private id$ = toObservable(this.id);

    article = toSignal(
        this.id$.pipe(
            switchMap(id => {
                if (!id) return of(null);
                return this.articleService.getArticle(id);
            })
        ),
        { initialValue: null }
    );

    constructor() {
        effect(() => {
            const article = this.article();
            if (article) {
                this.articleForm.patchValue({
                    title: article.title,
                    content: article.content
                });
            }
        });
    }

    onSubmit() {
        if (this.articleForm.invalid) return;

        this.loading = true;
        const formValue = this.articleForm.value;

        const articleData: any = {
            title: formValue.title,
            content: formValue.content
        };

        if (this.isEditing() && this.id()) {
            articleData.id = this.id();
            this.articleService.updateArticle(this.id()!, articleData).subscribe({
                next: () => this.router.navigate(['/admin']),
                error: () => this.loading = false
            });
        } else {
            this.articleService.createArticle(articleData).subscribe({
                next: () => this.router.navigate(['/admin']),
                error: () => this.loading = false
            });
        }
    }

    cancel() {
        this.router.navigate(['/admin']);
    }
}
