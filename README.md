# CMS Frontend - Angular Application

Frontend dell'applicazione CMS sviluppato con Angular 17 e Angular Material.

## ⚠️ STRUTTURA CORRETTA DELLE CARTELLE

La struttura del progetto è ora CORRETTA con cartelle separate (non con parentesi graffe nel nome):

```
src/app/
├── core/
│   ├── models/          ✅ (non {models)
│   ├── services/        ✅
│   ├── guards/          ✅
│   └── interceptors/    ✅
├── shared/
│   └── components/
│       ├── header/      ✅
│       └── footer/      ✅
└── features/
    ├── auth/
    │   ├── login/       ✅
    │   └── register/    ✅
    ├── content/
    │   ├── content-list/     ✅
    │   ├── content-detail/   ✅
    │   └── content-form/     ✅
    └── home/            ✅
```

## Tecnologie Utilizzate

- **Angular** 17.x
- **Angular Material** 17.x
- **TypeScript** 5.2.x
- **RxJS** 7.8.x
- **SCSS** per gli stili

## Prerequisiti

- Node.js 18.x o superiore
- npm 9.x o superiore
- Angular CLI 17.x

## Installazione

1. Installa le dipendenze:
```bash
npm install
```

2. Installa Angular CLI globalmente (se non già installato):
```bash
npm install -g @angular/cli
```

## Configurazione

### Environment

Modifica il file `src/environments/environment.ts` con l'URL del tuo backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

Per la produzione, modifica `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

## Avvio dell'Applicazione

### Modalità Sviluppo

```bash
ng serve
```

L'applicazione sarà disponibile su `http://localhost:4200`

### Con auto-reload
```bash
ng serve --open
```

### Su porta diversa
```bash
ng serve --port 4300
```

## Build

### Build di sviluppo
```bash
ng build
```

### Build di produzione
```bash
ng build --configuration production
```

I file di build saranno nella cartella `dist/cms-frontend/`

## Struttura del Progetto

```
src/app/
├── core/                       # Funzionalità core dell'app
│   ├── models/                 # Modelli TypeScript
│   │   ├── user.model.ts
│   │   ├── content.model.ts
│   │   ├── category.model.ts
│   │   ├── tag.model.ts
│   │   └── comment.model.ts
│   ├── services/               # Servizi Angular
│   │   ├── auth.service.ts
│   │   ├── content.service.ts
│   │   ├── category.service.ts
│   │   └── tag.service.ts
│   ├── guards/                 # Route guards
│   │   └── auth.guard.ts
│   └── interceptors/           # HTTP interceptors
│       └── auth.interceptor.ts
├── shared/                     # Componenti condivisi
│   └── components/
│       ├── header/
│       └── footer/
├── features/                   # Features/Moduli dell'app
│   ├── auth/                   # Autenticazione
│   │   ├── login/
│   │   └── register/
│   ├── content/                # Gestione contenuti
│   │   ├── content-list/
│   │   ├── content-detail/
│   │   └── content-form/
│   ├── home/                   # Homepage
│   └── admin/                  # Area amministrativa
│       └── dashboard/
├── app.component.ts            # Componente root
├── app.config.ts               # Configurazione app
└── app.routes.ts               # Routing

```

## Features Principali

### Autenticazione
- Login con JWT
- Registrazione nuovi utenti
- Logout
- Protezione delle route

### Gestione Contenuti
- Lista paginata dei contenuti
- Visualizzazione dettaglio contenuto
- Creazione/Modifica/Eliminazione contenuti (solo utenti autenticati)
- Filtro per categoria e tag
- Contatore visualizzazioni

### Categorie e Tag
- Visualizzazione categorie
- Filtro contenuti per categoria
- Gestione tag

### UI/UX
- Design responsive con Angular Material
- Navigazione intuitiva
- Form validation
- Snackbar per notifiche
- Loading states

## Componenti Principali

### Authentication Components

**Login Component** (`features/auth/login`)
- Form di login con validazione
- Redirect dopo login riuscito
- Gestione errori

**Register Component** (`features/auth/register`)
- Form di registrazione
- Validazione email e password
- Auto-login dopo registrazione

### Content Components

**Content List** (`features/content/content-list`)
- Grid di card responsive
- Paginazione
- Link a dettaglio

**Content Detail** (`features/content/content-detail`)
- Visualizzazione completa articolo
- Tag e categoria
- Incremento contatore visite

**Content Form** (`features/content/content-form`)
- Form per creazione/modifica
- Auto-generazione slug
- Gestione tag
- Upload immagine

### Shared Components

**Header** (`shared/components/header`)
- Navigazione principale
- Menu utente autenticato
- Logout

## Servizi

### AuthService
Gestisce autenticazione e stato utente:
```typescript
- login(credentials): Observable<AuthResponse>
- register(data): Observable<AuthResponse>
- logout(): void
- isAuthenticated(): boolean
- currentUser$: Observable<User>
```

### ContentService
Gestisce i contenuti:
```typescript
- getAllContents(page, size): Observable<PageResponse<Content>>
- getContentBySlug(slug): Observable<Content>
- createContent(data): Observable<Content>
- updateContent(id, data): Observable<Content>
- deleteContent(id): Observable<void>
```

### CategoryService
Gestisce le categorie:
```typescript
- getAllCategories(): Observable<Category[]>
- getCategoryById(id): Observable<Category>
- createCategory(data): Observable<Category>
```

## Guards

### AuthGuard
Protegge le route che richiedono autenticazione:
```typescript
/admin/** -> Richiede autenticazione
/content/new -> Richiede autenticazione
```

### AdminGuard
Protegge le route amministrative:
```typescript
/admin/** -> Richiede ruolo ADMIN
```

## Interceptors

### AuthInterceptor
Aggiunge automaticamente il token JWT alle richieste HTTP:
```typescript
Authorization: Bearer <token>
```

## Routing

```typescript
/ -> Home
/login -> Login
/register -> Registrazione
/contents -> Lista contenuti
/content/:slug -> Dettaglio contenuto
/admin/contents/new -> Crea contenuto (protetto)
/admin/contents/edit/:id -> Modifica contenuto (protetto)
```

## Stili

### Theme Angular Material
Il progetto usa il tema Indigo-Pink di Angular Material. Per cambiare tema, modifica `styles.scss`:

```scss
@use '@angular/material' as mat;
@include mat.core();

// Definisci il tuo tema
$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette);
```

### Custom Styles
Gli stili globali sono in `src/styles.scss`

## Test

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## Deployment

### Build per produzione
```bash
ng build --configuration production
```

### Deploy su server
Copia il contenuto della cartella `dist/cms-frontend/browser/` sul tuo server web (Apache, Nginx, ecc.)

### Configurazione Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist/cms-frontend/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploy su Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Troubleshooting

### Errore CORS
Assicurati che il backend abbia configurato CORS per accettare richieste da `http://localhost:4200`

### Errore "Cannot find module"
Esegui:
```bash
npm install
```

### Errore di compilazione TypeScript
Verifica la versione di TypeScript:
```bash
npm list typescript
```

### Port 4200 già in uso
Usa una porta diversa:
```bash
ng serve --port 4300
```

## Best Practices

1. **Standalone Components**: Usa i nuovi standalone components di Angular 17
2. **Signals**: Considera l'uso di Angular Signals per state management
3. **OnPush Change Detection**: Usa quando possibile per performance
4. **Lazy Loading**: Implementa per ridurre bundle size
5. **Error Handling**: Gestisci sempre gli errori HTTP
6. **Loading States**: Mostra feedback all'utente durante le operazioni

## Scripts npm Utili

```bash
npm start          # Avvia dev server
npm run build      # Build produzione
npm test           # Esegui test
npm run watch      # Build con watch mode
npm run lint       # Lint del codice
```

## Dipendenze Principali

- `@angular/core`: Framework Angular
- `@angular/material`: Componenti Material Design
- `@angular/router`: Routing
- `@angular/forms`: Gestione form
- `rxjs`: Programmazione reattiva

## Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## License

Questo progetto è open source e disponibile sotto la licenza MIT.

## Supporto

Per problemi o domande, apri un issue su GitHub o contatta il team di sviluppo.

## Roadmap

- [ ] Implementare lazy loading per i moduli
- [ ] Aggiungere PWA support
- [ ] Implementare server-side rendering (SSR)
- [ ] Aggiungere internazionalizzazione (i18n)
- [ ] Implementare dark mode
- [ ] Aggiungere rich text editor per i contenuti
- [ ] Implementare drag & drop per upload immagini
- [ ] Aggiungere ricerca full-text
- [ ] Implementare notifiche real-time
