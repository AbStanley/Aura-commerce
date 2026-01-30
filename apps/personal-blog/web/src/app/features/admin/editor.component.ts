import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="container">
      <header>
        <h1>{{ isEditing() ? 'Edit Article' : 'New Article' }}</h1>
      </header>
      
      <div class="card">
        <form [formGroup]="articleForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="title">Title</label>
            <input id="title" type="text" formControlName="title" placeholder="Article Title">
          </div>
          
          <div>
            <label for="content">Content</label>
            <textarea id="content" formControlName="content" rows="10" placeholder="Write your thoughts..."></textarea>
          </div>
          
          <div class="actions">
            <button type="button" class="btn-secondary" (click)="cancel()">Cancel</button>
            <button type="submit" class="btn" [disabled]="articleForm.invalid || loading">
              {{ loading ? 'Saving...' : 'Save Article' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }
  `]
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
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditing.set(true);
                this.currentId = id;
                this.loadArticle(id);
            }
        });
    }

    loadArticle(id: string) {
        this.articleService.getArticle(id).subscribe(article => {
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
            // Keep original date or update? Usually keep original published date, maybe update 'updatedDate'.
            // Backend handles ID check.
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
