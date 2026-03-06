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
      <div class="sidebar-col">
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
    }
    .sidebar-col {
      width: 280px; min-width: 280px;
      border-right: 1px solid #e0e0e0; overflow: hidden;
    }
    .window-col { flex: 1; overflow: hidden; }

    @media (max-width: 600px) {
      .sidebar-col { width: 100%; min-width: 0; }
      .window-col { display: none; }
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
