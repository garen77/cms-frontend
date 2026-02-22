import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { ContentService } from '../../../core/services/content.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Content, ContentRequest } from '../../../core/models/content.model';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  template: `
    <div class="content-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
            {{ isEditMode ? 'Modifica Articolo' : 'Nuovo Articolo' }}
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="loading" *ngIf="loadingContent">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <form [formGroup]="contentForm" (ngSubmit)="onSubmit()" *ngIf="!loadingContent">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Titolo</mat-label>
              <input matInput formControlName="title" placeholder="Inserisci il titolo"
                     (blur)="generateSlug()">
              <mat-error *ngIf="contentForm.get('title')?.hasError('required')">
                Titolo obbligatorio
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Slug (URL)</mat-label>
              <input matInput formControlName="slug" placeholder="slug-articolo">
              <mat-hint>Lascia vuoto per generare automaticamente dal titolo</mat-hint>
              <mat-error *ngIf="contentForm.get('slug')?.hasError('required')">
                Slug obbligatorio
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Categoria</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option [value]="null">Nessuna categoria</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.id">
                  {{ category.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Estratto (anteprima)</mat-label>
              <textarea matInput formControlName="excerpt" rows="3"
                        placeholder="Breve descrizione dell'articolo"></textarea>
              <mat-hint>Opzionale - verrà mostrato nelle anteprime</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contenuto</mat-label>
              <textarea matInput formControlName="body" rows="15"
                        placeholder="Scrivi il contenuto dell'articolo..."></textarea>
              <mat-hint>Supporta HTML per la formattazione</mat-hint>
              <mat-error *ngIf="contentForm.get('body')?.hasError('required')">
                Contenuto obbligatorio
              </mat-error>
            </mat-form-field>

            <div class="image-upload-section">
              <label class="image-upload-label">Immagine di copertina</label>

              <div class="image-preview" *ngIf="imagePreview || existingImageUrl">
                <img [src]="imagePreview || existingImageUrl" alt="Anteprima">
                <button mat-icon-button color="warn" type="button" (click)="removeImage()" class="remove-image-btn">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div class="image-upload-controls" *ngIf="!imagePreview && !existingImageUrl">
                <input type="file" #fileInput accept="image/*" (change)="onFileSelected($event)" hidden>
                <button mat-stroked-button type="button" (click)="fileInput.click()">
                  <mat-icon>cloud_upload</mat-icon>
                  Seleziona immagine
                </button>
              </div>

              <div class="image-upload-controls" *ngIf="imagePreview || existingImageUrl">
                <input type="file" #fileInputChange accept="image/*" (change)="onFileSelected($event)" hidden>
                <button mat-stroked-button type="button" (click)="fileInputChange.click()">
                  <mat-icon>swap_horiz</mat-icon>
                  Cambia immagine
                </button>
              </div>

              <mat-progress-bar mode="indeterminate" *ngIf="uploadingImage"></mat-progress-bar>
              <mat-hint class="image-hint">Formati supportati: JPG, PNG, GIF, WebP (max 5MB)</mat-hint>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tag</mat-label>
              <mat-chip-grid #chipGrid>
                <mat-chip-row *ngFor="let tag of tags" (removed)="removeTag(tag)">
                  {{ tag }}
                  <button matChipRemove>
                    <mat-icon>cancel</mat-icon>
                  </button>
                </mat-chip-row>
              </mat-chip-grid>
              <input placeholder="Aggiungi tag..."
                     [matChipInputFor]="chipGrid"
                     [matChipInputSeparatorKeyCodes]="separatorKeyCodes"
                     (matChipInputTokenEnd)="addTag($event)">
              <mat-hint>Premi Invio o virgola per aggiungere un tag</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Stato</mat-label>
              <mat-select formControlName="status">
                <mat-option value="DRAFT">Bozza</mat-option>
                <mat-option value="PUBLISHED">Pubblicato</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-divider></mat-divider>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/contents">
                <mat-icon>close</mat-icon>
                Annulla
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="loading || contentForm.invalid">
                <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? 'Salva Modifiche' : 'Pubblica' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .content-form-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    mat-card {
      padding: 20px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    mat-divider {
      margin: 24px 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-actions mat-spinner {
      display: inline-block;
    }

    .image-upload-section {
      margin-bottom: 16px;
      padding: 16px;
      border: 1px dashed #ccc;
      border-radius: 8px;
      background: #fafafa;
    }

    .image-upload-label {
      display: block;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 12px;
    }

    .image-preview {
      position: relative;
      display: inline-block;
      margin-bottom: 12px;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .remove-image-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.9);
    }

    .image-upload-controls {
      margin-bottom: 8px;
    }

    .image-upload-controls button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .image-hint {
      display: block;
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 8px;
    }

    mat-progress-bar {
      margin: 12px 0;
    }
  `]
})
export class ContentFormComponent implements OnInit {
  contentForm: FormGroup;
  categories: Category[] = [];
  tags: string[] = [];
  loading = false;
  loadingContent = false;
  isEditMode = false;
  contentId: number | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  existingImageUrl: string | null = null;
  existingImageId: number | null = null;
  uploadingImage = false;

  readonly separatorKeyCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.contentForm = this.fb.group({
      title: ['', Validators.required],
      slug: ['', Validators.required],
      categoryId: [null],
      excerpt: [''],
      body: ['', Validators.required],
      status: ['DRAFT']
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.contentId = parseInt(id, 10);
      this.loadContent(this.contentId);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }

  loadContent(id: number): void {
    this.loadingContent = true;
    this.contentService.getAllContents(0, 1000).subscribe({
      next: (response) => {
        const content = response.content.find(c => c.id === id);
        if (content) {
          this.populateForm(content);
        } else {
          this.snackBar.open('Articolo non trovato', 'Chiudi', {
            duration: 5000
          });
          this.router.navigate(['/contents']);
        }
        this.loadingContent = false;
      },
      error: () => {
        this.loadingContent = false;
        this.snackBar.open('Errore nel caricamento dell\'articolo', 'Chiudi', {
          duration: 5000
        });
        this.router.navigate(['/contents']);
      }
    });
  }

  populateForm(content: Content): void {
    this.contentForm.patchValue({
      title: content.title,
      slug: content.slug,
      categoryId: content.category?.id || null,
      excerpt: content.excerpt || '',
      body: content.body,
      status: content.status
    });

    if (content.featuredImage) {
      this.existingImageUrl = content.featuredImage.fileUrl;
      this.existingImageId = content.featuredImage.id;
    }

    this.tags = content.tags?.map(t => t.name) || [];
  }

  generateSlug(): void {
    const title = this.contentForm.get('title')?.value;
    const currentSlug = this.contentForm.get('slug')?.value;

    if (title && !currentSlug) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      this.contentForm.patchValue({ slug });
    }
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validazione tipo file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Formato file non supportato. Usa JPG, PNG, GIF o WebP.', 'Chiudi', {
          duration: 5000
        });
        return;
      }

      // Validazione dimensione (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.snackBar.open('Il file supera la dimensione massima di 5MB.', 'Chiudi', {
          duration: 5000
        });
        return;
      }

      this.selectedFile = file;

      // Crea preview locale
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Resetta l'immagine esistente
      this.existingImageUrl = null;
      this.existingImageId = null;
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;
    this.existingImageId = null;
  }

  private uploadImage(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      // Se non c'è un nuovo file, usa l'ID esistente
      if (!this.selectedFile) {
        resolve(this.existingImageId);
        return;
      }

      this.uploadingImage = true;
      this.contentService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.uploadingImage = false;
          resolve(response?.media?.id);
        },
        error: (error) => {
          this.uploadingImage = false;
          reject(error);
        }
      });
    });
  }

  async onSubmit(): Promise<void> {
    if (this.contentForm.invalid) {
      return;
    }

    this.loading = true;

    try {
      // Upload immagine se presente
      const featuredImageId = await this.uploadImage();

      const formValue = this.contentForm.value;

      const request: ContentRequest = {
        title: formValue.title,
        slug: formValue.slug,
        categoryId: formValue.categoryId,
        excerpt: formValue.excerpt || undefined,
        body: formValue.body,
        featuredImageId: featuredImageId || undefined,
        status: formValue.status,
        tags: this.tags
      };

      const operation = this.isEditMode && this.contentId
        ? this.contentService.updateContent(this.contentId, request)
        : this.contentService.createContent(request);

      operation.subscribe({
        next: (content) => {
          this.snackBar.open(
            this.isEditMode ? 'Articolo aggiornato con successo!' : 'Articolo creato con successo!',
            'Chiudi',
            {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
          this.router.navigate(['/content', content.slug]);
        },
        error: (error) => {
          this.loading = false;
          let message = 'Errore durante il salvataggio';
          if (error.error?.message) {
            message = error.error.message;
          }
          this.snackBar.open(message, 'Chiudi', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } catch (error) {
      this.loading = false;
      this.snackBar.open('Errore durante il caricamento dell\'immagine', 'Chiudi', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
