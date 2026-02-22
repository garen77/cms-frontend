import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="logo" routerLink="/">CMS</span>
      
      <span class="spacer"></span>
      
      <nav>
        <a mat-button routerLink="/" routerLinkActive="active" 
           [routerLinkActiveOptions]="{exact: true}">Home</a>
        <a mat-button routerLink="/contents" routerLinkActive="active">Articoli</a>
        
        <ng-container *ngIf="isAuthenticated()">
          <a mat-button routerLink="/admin/contents/new" routerLinkActive="active" 
             *ngIf="isEditor()">Nuovo Articolo</a>
          
          <button mat-button [matMenuTriggerFor]="menu" class="user-menu-btn">
            <span class="user-menu-content">
              <img *ngIf="currentUser?.avatarUrl"
                   [src]="currentUser?.avatarUrl"
                   [alt]="currentUser?.username"
                   class="user-avatar">
              <mat-icon *ngIf="!currentUser?.avatarUrl">account_circle</mat-icon>
              <span class="username">{{ currentUser?.username }}</span>
            </span>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              Profilo
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </ng-container>
        
        <ng-container *ngIf="!isAuthenticated()">
          <a mat-button routerLink="/login">Login</a>
          <a mat-raised-button color="accent" routerLink="/register">Registrati</a>
        </ng-container>
      </nav>
    </mat-toolbar>
  `,
  styles: [`
    .logo {
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
    }

    .spacer {
      flex: 1 1 auto;
    }

    nav {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .user-menu-content {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      vertical-align: middle;
    }

    .user-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.3);
      vertical-align: middle;
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUserValue;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isEditor(): boolean {
    return this.authService.isEditor();
  }

  logout(): void {
    this.authService.logout();
  }
}
