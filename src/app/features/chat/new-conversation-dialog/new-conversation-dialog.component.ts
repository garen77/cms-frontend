import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-new-conversation-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatListModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Nuova conversazione</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Cerca utente</mat-label>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="Username…" />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="spinner-wrap" *ngIf="loading">
        <mat-spinner diameter="32" />
      </div>

      <mat-nav-list *ngIf="!loading">
        <mat-list-item
          *ngFor="let user of filteredUsers"
          (click)="select(user)"
          class="user-item">
          <div class="user-row">
            <div class="avatar">{{ user.username[0].toUpperCase() }}</div>
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="email">{{ user.email }}</span>
            </div>
          </div>
        </mat-list-item>
        <p class="empty" *ngIf="filteredUsers.length === 0 && searchQuery">
          Nessun utente trovato
        </p>
      </mat-nav-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annulla</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .search-field { width: 100%; }
    mat-dialog-content { min-width: 300px; max-height: 400px; }
    .spinner-wrap { display: flex; justify-content: center; padding: 16px; }
    mat-nav-list { padding: 0; }
    mat-list-item { cursor: pointer; height: auto !important; }
    mat-list-item:hover { background: rgba(0,0,0,0.04); }
    .user-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; width: 100%; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; flex-shrink: 0;
    }
    .user-info { display: flex; flex-direction: column; }
    .username { font-weight: 500; font-size: 14px; }
    .email { font-size: 12px; color: #888; }
    .empty { padding: 16px; color: #999; text-align: center; }
  `]
})
export class NewConversationDialogComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<NewConversationDialogComponent>);

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  loading = false;

  ngOnInit(): void {
    this._search('');
  }

  onSearch(): void {
    this._search(this.searchQuery.trim());
  }

  private _search(q: string): void {
    this.loading = true;
    this.http.get<User[]>(`${environment.apiUrl}/users/search`, { params: { q } }).subscribe({
      next: users => {
        this.allUsers = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  select(user: User): void {
    this.dialogRef.close(user);
  }
}
