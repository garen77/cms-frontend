import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person</mat-icon>
            Il mio profilo
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="avatar-section">
            <div class="avatar-container">
              <img *ngIf="currentUser?.avatarUrl"
                   [src]="currentUser?.avatarUrl"
                   [alt]="currentUser?.username"
                   class="avatar-large">
              <div *ngIf="!currentUser?.avatarUrl" class="avatar-placeholder-large">
                <mat-icon>account_circle</mat-icon>
              </div>

              <div class="avatar-overlay" *ngIf="!uploading">
                <input type="file" #avatarInput
                       accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                       (change)="onAvatarSelected($event)" hidden>
                <button mat-mini-fab color="primary" (click)="avatarInput.click()" title="Cambia avatar">
                  <mat-icon>photo_camera</mat-icon>
                </button>
                <button mat-mini-fab color="warn" (click)="deleteAvatar()"
                        *ngIf="currentUser?.avatarUrl" title="Rimuovi avatar">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <div class="avatar-loading" *ngIf="uploading">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            </div>
            <p class="avatar-hint">Clicca per cambiare l'avatar (max 5MB)</p>
          </div>

          <mat-divider></mat-divider>

          <div class="user-info">
            <div class="info-row">
              <span class="info-label">Username:</span>
              <span class="info-value">{{ currentUser?.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ currentUser?.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ruolo:</span>
              <span class="info-value role-badge" [class]="'role-' + currentUser?.role?.toLowerCase()">
                {{ getRoleLabel(currentUser?.role) }}
              </span>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <a mat-button routerLink="/contents">
            <mat-icon>arrow_back</mat-icon>
            Torna agli articoli
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    }

    .profile-card {
      width: 100%;
      max-width: 500px;
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

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
    }

    .avatar-container {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .avatar-large {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .avatar-placeholder-large {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .avatar-placeholder-large mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #bdbdbd;
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .avatar-container:hover .avatar-overlay {
      opacity: 1;
    }

    .avatar-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      padding: 20px;
    }

    .avatar-hint {
      margin-top: 12px;
      font-size: 0.875rem;
      color: #666;
    }

    mat-divider {
      margin: 24px 0;
    }

    .user-info {
      padding: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 500;
      color: #666;
    }

    .info-value {
      color: #333;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .role-admin {
      background: #f44336;
      color: white;
    }

    .role-editor {
      background: #2196f3;
      color: white;
    }

    .role-author {
      background: #4caf50;
      color: white;
    }

    .role-subscriber {
      background: #9e9e9e;
      color: white;
    }

    mat-card-actions {
      padding-top: 16px;
    }

    mat-card-actions a {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  uploading = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Carica avatar se non presente
    if (this.currentUser && !this.currentUser.avatarUrl) {
      this.authService.loadUserAvatar();
    }
  }

  get currentUser(): User | null {
    return this.authService.currentUserValue;
  }

  getRoleLabel(role?: string): string {
    const labels: { [key: string]: string } = {
      'ADMIN': 'Amministratore',
      'EDITOR': 'Editor',
      'AUTHOR': 'Autore',
      'SUBSCRIBER': 'Subscriber'
    };
    return role ? labels[role] || role : '';
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validazione tipo file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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

      this.uploadAvatar(file);
    }
  }

  uploadAvatar(file: File): void {
    this.uploading = true;
    this.authService.uploadAvatar(file).subscribe({
      next: () => {
        this.uploading = false;
        this.snackBar.open('Avatar aggiornato con successo!', 'Chiudi', {
          duration: 3000
        });
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Errore durante il caricamento dell\'avatar.', 'Chiudi', {
          duration: 5000
        });
      }
    });
  }

  deleteAvatar(): void {
    if (!confirm('Sei sicuro di voler rimuovere il tuo avatar?')) {
      return;
    }

    this.uploading = true;
    this.authService.deleteAvatar().subscribe({
      next: () => {
        this.uploading = false;
        this.snackBar.open('Avatar rimosso con successo!', 'Chiudi', {
          duration: 3000
        });
      },
      error: (error) => {
        this.uploading = false;
        const message = error.error?.message || 'Errore durante la rimozione dell\'avatar.';
        this.snackBar.open(message, 'Chiudi', {
          duration: 5000
        });
      }
    });
  }
}
