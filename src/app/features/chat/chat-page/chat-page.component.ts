import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule,
    ChatSidebarComponent, ChatWindowComponent
  ],
  template: `
    <div class="banner" *ngIf="!(chatService.connected$ | async)">
      <mat-icon>wifi_off</mat-icon>
      Connessione in tempo reale non disponibile, riprovo…
    </div>
    <div class="chat-layout">
      <div class="sidebar-overlay"
           [class.visible]="chatService.mobileSidebarOpen$ | async"
           (click)="chatService.mobileSidebarOpen$.next(false)">
      </div>
      <div class="sidebar-col" [class.open]="chatService.mobileSidebarOpen$ | async">
        <app-chat-sidebar />
      </div>
      <div class="window-col">
        <app-chat-window />
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: calc(100vh - 64px); }
    .banner {
      display: flex; align-items: center; gap: 8px;
      background: #ff9800; color: white;
      padding: 8px 16px; font-size: 13px;
    }
    .chat-layout {
      display: flex; flex: 1; overflow: hidden;
      background: white; border-radius: 8px;
      margin: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      position: relative;
    }
    .sidebar-col {
      width: 280px; min-width: 280px;
      border-right: 1px solid #e0e0e0; overflow: hidden;
    }
    .window-col { flex: 1; overflow: hidden; min-width: 0; }
    .sidebar-overlay { display: none; }

    @media (max-width: 600px) {
      :host { height: calc(100vh - 56px); }
      .chat-layout { margin: 0; border-radius: 0; box-shadow: none; }
      .sidebar-col {
        position: fixed;
        top: 0; left: 0;
        width: 280px; height: 100vh;
        z-index: 200;
        background: white;
        box-shadow: 2px 0 12px rgba(0,0,0,0.2);
        transform: translateX(-100%);
        transition: transform 0.28s ease;
        overflow: hidden;
      }
      .sidebar-col.open { transform: translateX(0); }
      .window-col { display: block; width: 100%; }
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        z-index: 199;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.28s ease;
      }
      .sidebar-overlay.visible {
        opacity: 1;
        pointer-events: all;
      }
    }
  `]
})
export class ChatPageComponent implements OnInit, OnDestroy {
  chatService = inject(ChatService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private subs = new Subscription();

  ngOnInit(): void {
    const token = this.authService.getToken();
    const username = this.authService.currentUserValue?.username;
    if (token && username) {
      this.chatService.connect(token, username);
    }

    if (window.innerWidth <= 600 && this.chatService.activeConversation$.value === null) {
      this.chatService.mobileSidebarOpen$.next(true);
    }

    this.chatService.getConversations().subscribe({
      next: convs => this.chatService.conversations$.next(convs),
      error: () => this.snackBar.open('Errore caricamento conversazioni', 'OK', { duration: 3000 })
    });

    this.subs.add(
      this.chatService.connected$.subscribe(connected => {
        if (!connected && !this.authService.isAuthenticated()) {
          this.authService.logout();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.subs.unsubscribe();
  }
}
