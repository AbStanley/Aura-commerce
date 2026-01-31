import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
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
    private route = inject(ActivatedRoute);

    articleForm = this.fb.group({
        title: ['', Validators.required],
        content: ['', Validators.required]
    });

    loading = false;
    isEditing = signal(false);
    currentId: string | null = null;

    constructor() {
        // Check for ID param
        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id');
            if (id) {
                this.isEditing.set(true);
                this.currentId = id;
                this.loadArticle(id);
            }
        });
    }

    loadArticle(id: string) {
        this.articleService.getArticle(id).subscribe((article: Article) => {
            this.articleForm.patchValue({
                title: article.title,
                content: article.content
            });
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

        if (this.isEditing() && this.currentId) {
            articleData.id = this.currentId;
            this.articleService.updateArticle(this.currentId, articleData).subscribe({
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
