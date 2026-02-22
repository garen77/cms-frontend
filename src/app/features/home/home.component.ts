import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContentService } from '../../core/services/content.service';
import { AuthService } from '../../core/services/auth.service';
import { Content } from '../../core/models/content.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="home-container">
      <section class="hero">
        <h1>Benvenuto nel CMS</h1>
        <p>La piattaforma per gestire i tuoi contenuti in modo semplice e veloce</p>
        <div class="hero-actions">
          <a mat-raised-button color="primary" routerLink="/contents">
            <mat-icon>article</mat-icon>
            Esplora Articoli
          </a>
          <a mat-raised-button color="accent" routerLink="/register" *ngIf="!isAuthenticated()">
            <mat-icon>person_add</mat-icon>
            Registrati
          </a>
          <a mat-raised-button color="accent" routerLink="/admin/contents/new" *ngIf="isEditor()">
            <mat-icon>add</mat-icon>
            Nuovo Articolo
          </a>
        </div>
      </section>

      <section class="latest-contents">
        <h2>Ultimi Articoli</h2>

        <div class="loading" *ngIf="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div class="contents-grid" *ngIf="!loading">
          <mat-card *ngFor="let content of latestContents" class="content-card">
            <mat-card-header>
              <mat-card-title>{{ content.title }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon>person</mat-icon> {{ content.author?.username || 'Anonimo' }}
                <span class="separator">|</span>
                <mat-icon>calendar_today</mat-icon> {{ content.publishedAt | date:'dd/MM/yyyy' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ content.excerpt || (content.body | slice:0:150) + '...' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button color="primary" [routerLink]="['/content', content.slug]">
                Leggi di più
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="no-contents" *ngIf="!loading && latestContents.length === 0">
          <mat-icon>inbox</mat-icon>
          <p>Nessun articolo disponibile</p>
        </div>

        <div class="view-all" *ngIf="latestContents.length > 0">
          <a mat-stroked-button color="primary" routerLink="/contents">
            Vedi tutti gli articoli
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #3f51b5 0%, #7986cb 100%);
      color: white;
      border-radius: 8px;
      margin-bottom: 40px;
    }

    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .hero p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions a {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .latest-contents h2 {
      text-align: center;
      margin-bottom: 24px;
      color: #333;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .contents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .content-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .content-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
    }

    mat-card-subtitle mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .separator {
      margin: 0 8px;
    }

    mat-card-content p {
      color: #666;
      line-height: 1.6;
    }

    mat-card-actions {
      padding: 8px 16px 16px;
    }

    mat-card-actions a {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .no-contents {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-contents mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .view-all {
      text-align: center;
      margin-top: 32px;
    }

    .view-all a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class HomeComponent implements OnInit {
  latestContents: Content[] = [];
  loading = true;

  constructor(
    private contentService: ContentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLatestContents();
  }

  loadLatestContents(): void {

    if(this?.authService?.currentUserValue?.id) {
        this.contentService.getContentsByAuthor(this?.authService?.currentUserValue?.id, 0, 6).subscribe({
            next: (response) => {
              this.latestContents = response.content;
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
        });
    } else {
        this.contentService.getAllContents(0, 6).subscribe({
          next: (response) => {
            this.latestContents = response.content;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isEditor(): boolean {
    return this.authService.isEditor();
  }
}
