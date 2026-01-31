import { Routes, Router } from '@angular/router';
import { HomeComponent } from './features/guest/home.component';
import { ArticleDetailComponent } from './features/guest/article-detail.component';
import { LoginComponent } from './features/admin/login.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { EditorComponent } from './features/admin/editor.component';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

const authGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isAuthenticated() ? true : router.createUrlTree(['/admin/login']);
};

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'article/:id', component: ArticleDetailComponent },
    { path: 'admin/login', component: LoginComponent },
    {
        path: 'admin',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'admin/editor',
        component: EditorComponent,
        canActivate: [authGuard]
    },
    {
        path: 'admin/editor/:id',
        component: EditorComponent,
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '' }
];
