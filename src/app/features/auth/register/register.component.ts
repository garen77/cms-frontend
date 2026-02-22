import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Registrati
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Scegli un username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                Username obbligatorio
              </mat-error>
              <mat-error *ngIf="registerForm.get('username')?.hasError('minlength')">
                Username deve avere almeno 3 caratteri
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="Inserisci email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email obbligatoria
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Formato email non valido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password" placeholder="Scegli una password">
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password obbligatoria
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password deve avere almeno 6 caratteri
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Conferma Password</mat-label>
              <input matInput [type]="hideConfirmPassword ? 'password' : 'text'"
                     formControlName="confirmPassword" placeholder="Conferma la password">
              <button mat-icon-button matSuffix type="button"
                      (click)="hideConfirmPassword = !hideConfirmPassword">
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                Conferma password obbligatoria
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ruolo</mat-label>
              <mat-select formControlName="role">
                <mat-option value="SUBSCRIBER">Subscriber - Solo lettura</mat-option>
                <mat-option value="AUTHOR">Author - Gestisce i propri contenuti</mat-option>
                <mat-option value="EDITOR">Editor - Gestisce tutti i contenuti</mat-option>
                <mat-option value="ADMIN">Admin - Accesso completo</mat-option>
              </mat-select>
              <mat-icon matSuffix>badge</mat-icon>
              <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
                Ruolo obbligatorio
              </mat-error>
            </mat-form-field>

            <div class="avatar-upload-section">
              <label class="avatar-upload-label">Avatar (opzionale)</label>
              <div class="avatar-preview-container">
                <div class="avatar-preview" *ngIf="avatarPreview">
                  <img [src]="avatarPreview" alt="Avatar preview">
                  <button mat-icon-button color="warn" type="button" (click)="removeAvatar()" class="remove-avatar-btn">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="avatar-placeholder" *ngIf="!avatarPreview" (click)="avatarInput.click()">
                  <mat-icon>account_circle</mat-icon>
                  <span>Clicca per selezionare</span>
                </div>
              </div>
              <input type="file" #avatarInput accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                     (change)="onAvatarSelected($event)" hidden>
              <button mat-stroked-button type="button" (click)="avatarInput.click()" *ngIf="avatarPreview">
                <mat-icon>swap_horiz</mat-icon>
                Cambia avatar
              </button>
              <mat-hint class="avatar-hint">Formati: JPG, PNG, GIF, WebP (max 5MB)</mat-hint>
            </div>

            <mat-error class="password-mismatch" *ngIf="passwordMismatch">
              Le password non corrispondono
            </mat-error>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Registrati</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            Hai già un account?
            <a routerLink="/login">Accedi</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 20px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      padding: 20px;
    }

    mat-card-header {
      justify-content: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .password-mismatch {
      display: block;
      text-align: center;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .submit-btn {
      margin-top: 16px;
      height: 48px;
      font-size: 1rem;
    }

    .submit-btn mat-spinner {
      display: inline-block;
    }

    mat-card-actions {
      text-align: center;
      padding-top: 16px;
    }

    .login-link {
      color: #666;
    }

    .login-link a {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    .avatar-upload-section {
      margin-bottom: 16px;
      text-align: center;
    }

    .avatar-upload-label {
      display: block;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 12px;
      text-align: left;
    }

    .avatar-preview-container {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }

    .avatar-preview {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .avatar-preview img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .remove-avatar-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 2px dashed #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
      background: #fafafa;
    }

    .avatar-placeholder:hover {
      border-color: #3f51b5;
      background: #f0f0f0;
    }

    .avatar-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #bdbdbd;
    }

    .avatar-placeholder span {
      font-size: 0.75rem;
      color: #999;
      margin-top: 4px;
    }

    .avatar-hint {
      display: block;
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 8px;
    }

    .avatar-upload-section button {
      margin-top: 8px;
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['SUBSCRIBER', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  get passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return confirmPassword && password !== confirmPassword;
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

      this.avatarFile = file;

      // Crea preview locale
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.avatarFile = null;
    this.avatarPreview = null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch) {
      return;
    }

    this.loading = true;
    const { username, email, password, role } = this.registerForm.value;

    this.authService.register({ username, email, password, role }).subscribe({
      next: () => {
        // Se c'è un avatar da caricare, lo facciamo dopo la registrazione
        if (this.avatarFile) {
          this.uploadAvatar();
        } else {
          this.onRegistrationComplete();
        }
      },
      error: (error) => {
        this.loading = false;
        let message = 'Errore durante la registrazione';
        if (error.status === 409) {
          message = 'Username o email già in uso';
        } else if (error.error?.message) {
          message = error.error.message;
        }
        this.snackBar.open(message, 'Chiudi', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  private uploadAvatar(): void {
    if (!this.avatarFile) {
      this.onRegistrationComplete();
      return;
    }

    this.authService.uploadAvatar(this.avatarFile).subscribe({
      next: () => {
        this.onRegistrationComplete();
      },
      error: () => {
        // Avatar upload fallito, ma la registrazione è avvenuta con successo
        this.snackBar.open('Registrazione completata, ma errore nel caricamento avatar.', 'Chiudi', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/']);
      }
    });
  }

  private onRegistrationComplete(): void {
    this.snackBar.open('Registrazione completata con successo!', 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/']);
  }
}
