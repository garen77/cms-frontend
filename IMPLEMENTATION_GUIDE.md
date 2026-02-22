# Guida Implementazione Completa Frontend Angular

Questa guida contiene tutto il codice TypeScript necessario per implementare il frontend Angular del CMS.

## IMPORTANTE: Copia i file seguendo la struttura indicata

---

## 1. ENVIRONMENT FILES

### src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

### src/environments/environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

---

## 2. CORE SERVICES

### src/app/core/services/auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          const user: User = {
            id: 0,
            username: response.username,
            email: response.email,
            role: response.role
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          const user: User = {
            id: 0,
            username: response.username,
            email: response.email,
            role: response.role
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  isEditor(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'EDITOR';
  }
}
```

### src/app/core/services/content.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Content, ContentRequest, PageResponse } from '../models/content.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/contents`;

  constructor(private http: HttpClient) {}

  getAllContents(page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(this.apiUrl, { params });
  }

  getContentBySlug(slug: string): Observable<Content> {
    return this.http.get<Content>(`${this.apiUrl}/${slug}`);
  }

  createContent(request: ContentRequest): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, request);
  }

  updateContent(id: number, request: ContentRequest): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${id}`, request);
  }

  deleteContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getContentsByCategory(categoryId: number, page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(`${this.apiUrl}/category/${categoryId}`, { params });
  }

  getContentsByTag(tagId: number, page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(`${this.apiUrl}/tag/${tagId}`, { params });
  }
}
```

### src/app/core/services/category.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(name: string, slug: string, description?: string): Observable<Category> {
    const params: any = { name, slug };
    if (description) params.description = description;
    return this.http.post<Category>(this.apiUrl, null, { params });
  }

  updateCategory(id: number, name: string, slug: string, description?: string): Observable<Category> {
    const params: any = { name, slug };
    if (description) params.description = description;
    return this.http.put<Category>(`${this.apiUrl}/${id}`, null, { params });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 3. GUARDS AND INTERCEPTORS

### src/app/core/guards/auth.guard.ts
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const editorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isEditor()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

### src/app/core/interceptors/auth.interceptor.ts
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

---

## 4. APP CONFIGURATION

### src/app/app.config.ts
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync()
  ]
};
```

### src/app/app.routes.ts
```typescript
import { Routes } from '@angular/router';
import { authGuard, editorGuard } from './core/guards/auth.guard';

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
    path: 'admin', 
    canActivate: [authGuard, editorGuard],
    children: [
      { 
        path: 'contents/new', 
        loadComponent: () => import('./features/content/content-form/content-form.component').then(m => m.ContentFormComponent) 
      },
      { 
        path: 'contents/edit/:id', 
        loadComponent: () => import('./features/content/content-form/content-form.component').then(m => m.ContentFormComponent) 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

### src/app/app.component.ts
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent {
  title = 'cms-frontend';
}
```

---

## 5. NOTA IMPORTANTE

Per i componenti completi (Login, Register, Content List, Content Detail, Content Form, Header, Home),
fai riferimento al codice che ti ho fornito nella conversazione precedente.

Ogni componente deve essere creato come standalone component con i relativi import di Angular Material.

---

## 6. STYLES

### src/styles.scss
```scss
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
$my-warn: mat.define-palette(mat.$red-palette);

$my-theme: mat.define-light-theme((
  color: (
    primary: $my-primary,
    accent: $my-accent,
    warn: $my-warn,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($my-theme);

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Roboto, "Helvetica Neue", sans-serif;
  background-color: #f5f5f5;
}

html, body {
  height: 100%;
}
```

---

## 7. MAIN FILES

### src/main.ts
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### src/index.html
```html
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <title>CMS Frontend</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## INSTALLAZIONE

1. Installa le dipendenze:
```bash
npm install
```

2. Avvia l'applicazione:
```bash
ng serve
```

3. Apri il browser su `http://localhost:4200`

## NOTA FINALE

Tutti i componenti devono seguire il pattern Standalone Component di Angular 17.
Usa Angular Material per l'UI e implementa la gestione degli errori con MatSnackBar.
