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

## Deploy

### Frontend - Vercel
- Build command: `ng build --configuration production`
- Output directory: `dist/cms-frontend/browser` (Angular 17 con builder esbuild genera in `/browser`)
- Routing: configurato in `vercel.json` con rewrites su `index.html` per il routing client-side

### Backend - Render
- URL: `https://cms-x5bw.onrender.com`
- Framework: Spring Boot
- CORS configurato in Spring Security per accettare richieste dal dominio Vercel

---

## UI Design — Animated Background

### Concept

Il background dell'applicazione combina un **gradiente animato** con un **pattern di onde/curve SVG** sovrapposto. L'effetto è elegante e visibile ma non distrae dal contenuto. La palette è derivata dal tema Material già in uso (Indigo + Pink), con varianti chiare (50-100) per un aspetto luminoso e leggero.

### Palette colori

| Token          | Valore      | Uso                          |
|----------------|-------------|------------------------------|
| `--bg-color-1` | `#e8eaf6`   | Indigo 50 (chiaro)           |
| `--bg-color-2` | `#c5cae9`   | Indigo 100                   |
| `--bg-color-3` | `#f3e5f5`   | Purple 50 (chiaro)           |
| `--bg-color-4` | `#fce4ec`   | Pink 50 (chiaro)             |
| `--wave-color` | `rgba(233, 30, 99, 0.08)` | Onde in pink accent (trasparente) |

> I valori sono variabili CSS — modificabili globalmente da `src/styles.scss`.

### Implementazione

**File da modificare:** `src/styles.scss`

Aggiungere le seguenti regole al body o a un wrapper globale:

```scss
// ─── Animated Background ───────────────────────────────────────────
:root {
  --bg-color-1: #e8eaf6;
  --bg-color-2: #c5cae9;
  --bg-color-3: #f3e5f5;
  --bg-color-4: #fce4ec;
  --wave-color: rgba(233, 30, 99, 0.08);
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--bg-color-1),
    var(--bg-color-2),
    var(--bg-color-3),
    var(--bg-color-4)
  );
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
  position: relative;
  overflow-x: hidden;
}

// Overlay con pattern SVG di onde
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='600'%3E%3Cpath fill='rgba(103,58,183,0.15)' d='M0,220C240,380,480,80,720,220C960,380,1200,80,1440,220L1440,600L0,600Z'/%3E%3Cpath fill='rgba(63,81,181,0.30)' d='M0,300C240,60,480,540,720,300C960,60,1200,540,1440,300L1440,600L0,600Z'/%3E%3Cpath fill='rgba(233,30,99,0.25)' d='M0,380C240,140,480,580,720,380C960,140,1200,580,1440,380L1440,600L0,600Z'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-size: 1440px 50vh;
  background-position: bottom;
  animation: waveDrift 20s linear infinite;
  opacity: 1;
  mask-image: linear-gradient(to bottom, transparent 30%, black 55%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 30%, black 55%);
}

// Tutti i contenuti sopra il background
app-root > * {
  position: relative;
  z-index: 1;
}

// ─── Keyframes ──────────────────────────────────────────────────────

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes waveDrift {
  0%   { background-position-x: 0px; }
  100% { background-position-x: 1440px; }
}
```

### Note implementative

- Il `z-index: 0` sul `::before` e `z-index: 1` sui figli di `app-root` assicurano che il background non blocchi l'interazione con i componenti.
- Se alcuni componenti usano `background: white` o colori opachi da Material, valutare l'aggiunta di `background: transparent` o `backdrop-filter` per mantenere l'effetto visibile.
- Per le card (`mat-card`), si consiglia un leggero effetto glassmorphism complementare:
  ```scss
  mat-card {
    background: rgba(255, 255, 255, 0.07) !important;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  ```
- La durata dell'animazione (`12s` per il gradiente, `20s` per le onde) è calibrata per un effetto "medio" — visibile ma non affaticante. Valori più alti = più lento/sottile.

### Accessibilità

- Verificare che il contrasto testo/sfondo rispetti WCAG AA (rapporto minimo 4.5:1) dopo l'applicazione del background scuro.
- Il pattern `pointer-events: none` sul `::before` garantisce che l'overlay non interferisca con la navigazione.

# Task: Implementa la chat one-to-one in tempo reale

## Contesto
Il backend Spring Boot espone già tutto il necessario:
- WebSocket STOMP su `ws://{API_BASE_URL}/ws?token={JWT}` (SockJS fallback su `http://`)
- Redis Pub/Sub per lo scaling multi-istanza
- REST API `/api/chat/**`

Il JWT è già gestito dall'app (salvato nel localStorage/sessionStorage dopo il login).
Gli utenti hanno: `id: number`, `username: string`.

  ---

## Dipendenze da installare
  ```bash
  npm install @stomp/rx-stomp rxjs
  npm install sockjs-client
  npm install @types/sockjs-client --save-dev
  ```
  ---
  1. ChatService (src/app/core/services/chat.service.ts)

  Crea un Angular service @Injectable({ providedIn: 'root' }) con:

  Connessione WebSocket

  - Usa RxStomp da @stomp/rx-stomp                                                                                                                                                  
  - Configura brokerURL con il token JWT nel query param: ws://{environment.apiUrl.replace('http','ws')}/ws?token=${token}                                                          
  - webSocketFactory che usa SockJS come fallback
  - connectHeaders: {} (auth via query param, non header, per compatibilità SockJS)
  - reconnectDelay: 5000                                                                                                                                                            
  - Esponi connected$: Observable<boolean> che mappa connectionState$                                                                                                               

  Metodi

  - connect(token: string): void — inizializza e attiva RxStomp
  - disconnect(): void                                                                                                                                                              
  - sendMessage(recipientId: number, content: string): void — pubblica su /app/chat.send con payload { recipientId, content }                                                       
  - sendHeartbeat(): void — pubblica su /app/chat.heartbeat ogni 20 secondi (usa setInterval avviato su connect, clearato su disconnect)
  - messages$: Observable<ChatMessage> — watch('/user/queue/messages').pipe(map(m => JSON.parse(m.body)))                                                                           

  REST (usa HttpClient)

  - getConversations(): Observable<ConversationSummary[]> → GET /api/chat/conversations                                                                                             
  - getHistory(userId: number, page = 0, size = 20): Observable<Page<ChatMessage>> → GET /api/chat/history/{userId}?page={page}&size={size}                                         
  - markAsRead(userId: number): Observable<void> → POST /api/chat/history/{userId}/read                                                                                             

  Interfacce TypeScript

  interface ChatMessage {
    id: number;
    senderId: number;
    senderUsername: string;
    recipientId: number;
    recipientUsername: string;
    content: string;
    isRead: boolean;
    createdAt: string; // ISO 8601                                                                                                                                                  
  }

  interface ConversationSummary {
    userId: number;
    username: string;
    lastMessage: string | null;
    unreadCount: number;
    updatedAt: string | null;
  }

  interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page                                                                                                                                                 
  }

  ---
  2. ChatStore o stato locale

  Mantieni nello stesso service (o in un BehaviorSubject dedicato):
  - conversations$: BehaviorSubject<ConversationSummary[]>                                                                                                                          
  - activeConversation$: BehaviorSubject<number | null> (userId del destinatario aperto)
  - messages$: BehaviorSubject<Map<number, ChatMessage[]>> — messages per userId

  Quando arriva un messaggio su /user/queue/messages:
  1. Aggiungilo alla lista del mittente (senderId) in messages$                                                                                                                     
  2. Aggiorna conversations$ (aggiorna lastMessage e unreadCount se la conversazione non è quella attiva)

  ---
  3. Componenti

  ChatSidebarComponent (colonna sinistra, ~280px)

  - Lista delle conversazioni da conversations$                                                                                                                                     
  - Per ogni conversazione: avatar/iniziali, username, lastMessage troncato, badge unreadCount (rosso, nascosto se 0)
  - Click su una conversazione: imposta activeConversation$, chiama markAsRead, carica history
  - Ordinamento: più recente in cima

  ChatWindowComponent (colonna destra)

  - Header: username del destinatario + indicatore online (opzionale, basato su presence)
  - Lista messaggi scrollabile — messaggi propri a destra (bg primario), altrui a sinistra (bg grigio)
  - Ogni messaggio: content, orario (HH:mm), check-mark letto/non letto per i messaggi inviati
  - Scroll automatico all'ultimo messaggio (usa ViewChild + scrollIntoView)
  - Infinite scroll verso l'alto per caricare pagine precedenti
  - Input bar in basso: textarea (Enter invia, Shift+Enter va a capo) + pulsante Invia
  - Al submit: chiama chatService.sendMessage(recipientId, content), ottimisticamente aggiungi il messaggio alla lista

  ChatPageComponent (contenitore)

  - Layout flex/grid: sidebar + window affiancati
  - Su mobile: sidebar o window, toggle tramite router o stato
  - Si connette al WebSocket onInit (prende il token da AuthService), si disconnette onDestroy                                                                                      

  ---
  4. Routing

  Aggiungi al router (dentro il guard AuthGuard):
  { path: 'chat', component: ChatPageComponent },
  { path: 'chat/:userId', component: ChatPageComponent }

  Il parametro :userId apre direttamente la conversazione con quell'utente.

  ---
  5. Gestione errori e edge cases

  - Se WebSocket non disponibile: mostra banner "Connessione in tempo reale non disponibile, riprovo…"
  - Se sendMessage fallisce (connessione assente): mostra toast di errore e rimuovi il messaggio ottimistico
  - Token scaduto durante la sessione WebSocket: intercetta la disconnessione e forza logout/refresh

  ---
  Note di integrazione

  - environment.apiUrl = http://localhost:8080 in dev, URL Render in prod
  - Tutti gli endpoint /api/chat/** richiedono Authorization: Bearer {JWT} nell'header HTTP (già gestito dall'HttpInterceptor esistente)
  - Il WebSocket usa il token nel query param (non nell'header) perché SockJS non supporta header custom durante l'handshake
  - I timestamp createdAt arrivano come LocalDateTime di Java → stringa ISO senza fuso orario (es. "2025-03-01T14:30:00") — usa date-fns o Angular DatePipe con 'HH:mm'             

  ---