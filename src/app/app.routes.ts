import { Routes } from '@angular/router';
import { authGuard, editorGuard, authorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'contents', 
    loadComponent: () => import('./features/content/content-list/content-list.component').then(m => m.ContentListComponent) 
  },
  {
    path: 'content/:slug',
    loadComponent: () => import('./features/content/content-detail/content-detail.component').then(m => m.ContentDetailComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'contents/new',
        canActivate: [authorGuard],
        loadComponent: () => import('./features/content/content-form/content-form.component').then(m => m.ContentFormComponent)
      },
      {
        path: 'contents/edit/:id',
        canActivate: [authorGuard],
        loadComponent: () => import('./features/content/content-form/content-form.component').then(m => m.ContentFormComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
