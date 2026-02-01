import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/api/articles';

    constructor() { }

    getArticles(): Observable<Article[]> {
        return this.http.get<Article[]>(this.apiUrl);
    }

    getArticle(id: string): Observable<Article> {
        return this.http.get<Article>(`${this.apiUrl}/${id}`);
    }

    createArticle(article: Article): Observable<Article> {
        // For now, no auth header needed if we rely on CORS/Cookie, 
        // but typically we'd intercept.
        return this.http.post<Article>(this.apiUrl, article);
    }

    updateArticle(id: string, article: Article): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, article);
    }

    deleteArticle(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
