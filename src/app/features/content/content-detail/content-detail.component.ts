import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { Content } from '../../../core/models/content.model';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="content-detail-container">
      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="not-found" *ngIf="!loading && !content">
        <mat-icon>search_off</mat-icon>
        <h2>Articolo non trovato</h2>
        <p>L'articolo che stai cercando non esiste o è stato rimosso.</p>
        <a mat-raised-button color="primary" routerLink="/contents">
          <mat-icon>arrow_back</mat-icon>
          Torna agli articoli
        </a>
      </div>

      <article *ngIf="!loading && content">
        <header class="article-header">
          <a mat-button routerLink="/contents" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Torna agli articoli
          </a>

          <h1>{{ content.title }}</h1>

          <div class="featured-image" *ngIf="content.featuredImage?.fileUrl">
            <img [src]="content.featuredImage?.fileUrl" [alt]="content.title">
          </div>

          <div class="meta">
            <span class="author">
              <mat-icon>person</mat-icon>
              {{ content.author?.username || 'Anonimo' }}
            </span>
            <span class="date">
              <mat-icon>calendar_today</mat-icon>
              {{ content.publishedAt | date:'dd MMMM yyyy' }}
            </span>
            <span class="views">
              <mat-icon>visibility</mat-icon>
              {{ content.viewCount }} visualizzazioni
            </span>
          </div>

          <div class="tags" *ngIf="content.category || (content.tags && content.tags.length > 0)">
            <mat-chip-set>
              <mat-chip *ngIf="content.category" color="primary" highlighted>
                {{ content.category.name }}
              </mat-chip>
              <mat-chip *ngFor="let tag of content.tags">
                {{ tag.name }}
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="actions" *ngIf="canEditContent()">
            <a mat-stroked-button color="primary" [routerLink]="['/admin/contents/edit', content.id]">
              <mat-icon>edit</mat-icon>
              Modifica
            </a>
            <button mat-stroked-button color="warn" (click)="confirmDelete()" *ngIf="canDeleteContent()">
              <mat-icon>delete</mat-icon>
              Elimina
            </button>
          </div>
        </header>

        <mat-divider></mat-divider>

        <div class="article-body" [innerHTML]="content.body">
        </div>

        <mat-divider></mat-divider>

        <footer class="article-footer">
          <div class="share">
            <span>Condividi:</span>
            <button mat-icon-button (click)="shareOnTwitter()" title="Condividi su Twitter">
              <mat-icon>share</mat-icon>
            </button>
            <button mat-icon-button (click)="copyLink()" title="Copia link">
              <mat-icon>link</mat-icon>
            </button>
          </div>

          <div class="navigation">
            <a mat-button routerLink="/contents">
              <mat-icon>list</mat-icon>
              Tutti gli articoli
            </a>
          </div>
        </footer>
      </article>
    </div>
  `,
  styles: [`
    .content-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 80px;
    }

    .not-found {
      text-align: center;
      padding: 80px 20px;
      color: #666;
    }

    .not-found mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
    }

    .not-found h2 {
      margin: 16px 0;
      color: #333;
    }

    .not-found p {
      margin-bottom: 24px;
    }

    .not-found a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .article-header {
      margin-bottom: 24px;
    }

    .back-link {
      margin-bottom: 16px;
      color: #666;
    }

    .article-header h1 {
      font-size: 2.5rem;
      line-height: 1.2;
      margin-bottom: 16px;
      color: #333;
    }

    .featured-image {
      margin-bottom: 24px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .featured-image img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 500px;
      object-fit: cover;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 16px;
      color: #666;
    }

    .meta span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .meta mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .tags {
      margin-bottom: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .actions a, .actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    mat-divider {
      margin: 24px 0;
    }

    .article-body {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #333;
    }

    .article-body ::ng-deep p {
      margin-bottom: 1.5em;
    }

    .article-body ::ng-deep h2,
    .article-body ::ng-deep h3,
    .article-body ::ng-deep h4 {
      margin-top: 2em;
      margin-bottom: 1em;
    }

    .article-body ::ng-deep img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5em 0;
    }

    .article-body ::ng-deep blockquote {
      border-left: 4px solid #3f51b5;
      padding-left: 20px;
      margin: 1.5em 0;
      color: #666;
      font-style: italic;
    }

    .article-body ::ng-deep code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    .article-body ::ng-deep pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }

    .article-body ::ng-deep pre code {
      background: transparent;
      padding: 0;
    }

    .article-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .share {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .navigation a {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `]
})
export class ContentDetailComponent implements OnInit {
  content: Content | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadContent(slug);
    } else {
      this.loading = false;
    }
  }

  loadContent(slug: string): void {
    this.contentService.getContentBySlug(slug).subscribe({
      next: (content) => {
        this.content = content;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  isEditor(): boolean {
    return this.authService.isEditor();
  }

  canEditContent(): boolean {
    return this.authService.canEditContent(this.content?.author?.id);
  }

  canDeleteContent(): boolean {
    // Solo ADMIN e EDITOR possono eliminare qualsiasi contenuto
    // AUTHOR può eliminare solo i propri contenuti
    return this.authService.canEditContent(this.content?.author?.id);
  }

  confirmDelete(): void {
    if (confirm('Sei sicuro di voler eliminare questo articolo? Questa azione non può essere annullata.')) {
      this.deleteContent();
    }
  }

  deleteContent(): void {
    if (!this.content) return;

    this.contentService.deleteContent(this.content.id).subscribe({
      next: () => {
        this.snackBar.open('Articolo eliminato con successo', 'Chiudi', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/contents']);
      },
      error: () => {
        this.snackBar.open('Errore durante l\'eliminazione', 'Chiudi', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  shareOnTwitter(): void {
    const url = window.location.href;
    const text = this.content?.title || '';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.snackBar.open('Link copiato negli appunti', 'Chiudi', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    });
  }
}
