# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 17 frontend for a Content Management System (CMS) built with standalone components, Angular Material, and TypeScript. The application communicates with a backend REST API for content management, user authentication, and role-based access control.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:4200)
ng serve

# Build for production
ng build --configuration production

# Run unit tests
ng test

# Build with watch mode
ng build --watch --configuration development
```

## Architecture

### Core Structure

The application follows Angular's recommended feature-based architecture:

- **core/**: Singleton services, guards, interceptors, and models used across the app
- **features/**: Feature modules organized by domain (auth, content, home)
- **shared/**: Reusable components (header, footer)

### Authentication Flow

1. **AuthService** (`src/app/core/services/auth.service.ts:40-118`) manages authentication state using a BehaviorSubject pattern
2. **AuthInterceptor** (`src/app/core/interceptors/auth.interceptor.ts:271-284`) automatically adds JWT tokens to HTTP requests
3. **AuthGuard** (`src/app/core/guards/auth.guard.ts:228-262`) protects routes requiring authentication
4. Tokens and user data are stored in localStorage
5. Three role levels: USER (default), EDITOR (can create/edit content), ADMIN (full access)

### HTTP Communication

- Base API URL configured in `src/environments/environment.ts:3` (development) and `environment.prod.ts` (production)
- All services extend from base URL: `${environment.apiUrl}/[resource]`
- HttpClient with functional interceptors (Angular 17 pattern)
- RxJS observables for async operations

### Routing

Routes defined in `src/app/app.routes.ts` using lazy loading:
- Public routes: `/`, `/login`, `/register`, `/contents`, `/content/:slug`
- Protected routes under `/admin/*` require authentication and editor/admin role
- Functional guards (`authGuard`, `editorGuard`) protect routes using Angular 17's inject() API

### State Management

- Authentication state managed through `AuthService.currentUserSubject` (BehaviorSubject)
- Current user observable: `AuthService.currentUser`
- No global state management library; services use RxJS for reactive state

## Key Patterns

### Standalone Components

All components use Angular 17's standalone API:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MaterialModules, ...],
  // ...
})
```

### Functional Interceptors and Guards

Using new Angular 17 functional approach instead of class-based:
- `authInterceptor: HttpInterceptorFn` instead of implementing `HttpInterceptor`
- `authGuard: CanActivateFn` instead of implementing `CanActivate`

### Service Injection

Services use `providedIn: 'root'` for tree-shakable providers

### Component Communication

- Parent-child: `@Input()` and `@Output()` decorators
- Cross-component: Shared services with observables

## Models and Types

Core TypeScript interfaces in `src/app/core/models/`:
- **User** (`user.model.ts`): User, LoginRequest, RegisterRequest, AuthResponse
- **Content** (`content.model.ts`): Content, ContentRequest, PageResponse<T>, Author
- **Category** (`category.model.ts`): Category model
- **Tag** (`tag.model.ts`): Tag model

PageResponse<T> wraps paginated backend responses with metadata (totalElements, totalPages, size, number).

## Backend Integration

API endpoints expected:
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Register new user
- `GET /api/contents?page=0&size=10` - Get paginated contents
- `GET /api/contents/:slug` - Get content by slug
- `POST /api/contents` - Create content (auth required)
- `PUT /api/contents/:id` - Update content (auth required)
- `DELETE /api/contents/:id` - Delete content (auth required)
- `GET /api/categories` - Get all categories
- `GET /api/contents/category/:id` - Get contents by category
- `GET /api/contents/tag/:id` - Get contents by tag

All authenticated requests include `Authorization: Bearer <token>` header via interceptor.

## Material Design

Angular Material 17.x provides UI components. Theme configured in `src/styles.scss`:
- Primary: Indigo palette
- Accent: Pink palette (A200, A100, A400)
- Warn: Red palette

Common Material modules used: MatToolbar, MatButton, MatCard, MatFormField, MatInput, MatSnackBar, MatIcon, MatMenu, MatChip, MatPaginator.

## TypeScript Configuration

Strict mode enabled (`tsconfig.json:6`) with:
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noPropertyAccessFromIndexSignature: true`
- Experimental decorators enabled for Angular
- Target: ES2022

## Environment Configuration

Default backend URL: `http://localhost:8080/api`

To change API endpoint, update `src/environments/environment.ts` for development or `environment.prod.ts` for production builds.