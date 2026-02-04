import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/catalog/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'products',
        redirectTo: '',
        pathMatch: 'full'
    }
];
