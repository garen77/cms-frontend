import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ContentService } from '../../../core/services/content.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { Content } from '../../../core/models/content.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="content-list-container">
      <header class="page-header">
        <h1>Articoli</h1>
        <a mat-raised-button color="primary" routerLink="/admin/contents/new" *ngIf="canCreateContent()">
          <mat-icon>add</mat-icon>
          Nuovo Articolo
        </a>
      </header>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Filtra per categoria</mat-label>
          <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryChange()">
            <mat-option [value]="null">Tutte le categorie</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category.id">
              {{ category.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="loading" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="contents-grid" *ngIf="!loading">
        <mat-card *ngFor="let content of contents" class="content-card">
          <div class="card-thumbnail" *ngIf="content.featuredImage?.fileUrl">
            <a [routerLink]="['/content', content.slug]">
              <img [src]="content.featuredImage?.fileUrl" [alt]="content.title">
            </a>
            <a class="edit-overlay" [routerLink]="['/admin/contents/edit', content.id]"
               *ngIf="canEditContent(content.author?.id)" title="Modifica">
              <mat-icon>edit</mat-icon>
            </a>
          </div>
          <div class="card-thumbnail card-thumbnail-placeholder" *ngIf="!content.featuredImage?.fileUrl">
            <mat-icon>image</mat-icon>
            <a class="edit-overlay" [routerLink]="['/admin/contents/edit', content.id]"
               *ngIf="canEditContent(content.author?.id)" title="Modifica">
              <mat-icon>edit</mat-icon>
            </a>
          </div>
          <mat-card-header>
            <mat-card-title>
              <a [routerLink]="['/content', content.slug]">{{ content.title }}</a>
            </mat-card-title>
            <mat-card-subtitle>
              <span class="author">
                <mat-icon>person</mat-icon>
                {{ content.author?.username || 'Anonimo' }}
              </span>
              <span class="date">
                <mat-icon>calendar_today</mat-icon>
                {{ content.publishedAt | date:'dd/MM/yyyy' }}
              </span>
              <span class="views">
                <mat-icon>visibility</mat-icon>
                {{ content.viewCount }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="excerpt">{{ content.excerpt || (content.body | slice:0:200) + '...' }}</p>

            <div class="meta">
              <mat-chip-set *ngIf="content.category">
                <mat-chip color="primary" highlighted>{{ content.category.name }}</mat-chip>
              </mat-chip-set>
              <mat-chip-set *ngIf="content.tags && content.tags.length > 0">
                <mat-chip *ngFor="let tag of content.tags">{{ tag.name }}</mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <a mat-button color="primary" [routerLink]="['/content', content.slug]">
              Leggi
              <mat-icon>arrow_forward</mat-icon>
            </a>
            <a mat-button color="accent" [routerLink]="['/admin/contents/edit', content.id]"
               *ngIf="canEditContent(content.author?.id)">
              <mat-icon>edit</mat-icon>
              Modifica
            </a>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="no-contents" *ngIf="!loading && contents.length === 0">
        <mat-icon>inbox</mat-icon>
        <h3>Nessun articolo trovato</h3>
        <p>Non ci sono articoli disponibili al momento.</p>
        <a mat-raised-button color="primary" routerLink="/admin/contents/new" *ngIf="canCreateContent()">
          Crea il primo articolo
        </a>
      </div>

      <mat-paginator
        *ngIf="totalElements > 0"
        [length]="totalElements"
        [pageSize]="pageSize"
        [pageIndex]="currentPage"
        [pageSizeOptions]="[5, 10, 20]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .content-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      color: #333;
    }

    .page-header a {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filters {
      margin-bottom: 24px;
    }

    .filters mat-form-field {
      min-width: 250px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }

    .contents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .content-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .content-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .card-thumbnail {
      position: relative;
      width: 100%;
      height: 180px;
      overflow: hidden;
      border-radius: 4px 4px 0 0;
    }

    .card-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-thumbnail:hover img {
      transform: scale(1.05);
    }

    .card-thumbnail-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
    }

    .card-thumbnail-placeholder > mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #bdbdbd;
    }

    .edit-overlay {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 40px;
      height: 40px;
      background: rgba(63, 81, 181, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .edit-overlay mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .card-thumbnail:hover .edit-overlay {
      opacity: 1;
    }

    mat-card-title a {
      color: #333;
      text-decoration: none;
    }

    mat-card-title a:hover {
      color: #3f51b5;
    }

    mat-card-subtitle {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 8px;
    }

    mat-card-subtitle span {
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

    .excerpt {
      color: #666;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
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
      color: #666;
    }

    .no-contents mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ccc;
    }

    .no-contents h3 {
      margin: 16px 0 8px;
    }

    .no-contents p {
      margin-bottom: 24px;
    }

    mat-paginator {
      background: transparent;
    }
  `]
})
export class ContentListComponent implements OnInit {
  contents: Content[] = [];
  categories: Category[] = [];
  loading = true;

  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  selectedCategory: number | null = null;

  constructor(
    private contentService: ContentService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadContents();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadContents(): void {
    this.loading = true;

    /*const request = this.selectedCategory
      ? this.contentService.getContentsByCategory(this.selectedCategory, this.currentPage, this.pageSize)
      : (this?.authService?.currentUserValue?.id ? this.contentService.getContentsByAuthor(this?.authService?.currentUserValue?.id, this.currentPage, this.pageSize)
        : this.contentService.getAllContents(this.currentPage, this.pageSize))
      ;*/
    const request = this.selectedCategory
      ? this.contentService.getContentsByCategory(this.selectedCategory, this.currentPage, this.pageSize)
      : this.contentService.getAllContents(this.currentPage, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.contents = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadContents();
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.loadContents();
  }

  isEditor(): boolean {
    return this.authService.isEditor();
  }

  canCreateContent(): boolean {
    return this.authService.canCreateContent();
  }

  canEditContent(authorId?: number): boolean {
    return this.authService.canEditContent(authorId);
  }
}
