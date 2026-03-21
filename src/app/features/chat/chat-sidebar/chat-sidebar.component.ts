import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatService } from '../../../core/services/chat.service';
import { ConversationSummary } from '../../../core/models/chat.model';
import { NewConversationDialogComponent } from '../new-conversation-dialog/new-conversation-dialog.component';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Messaggi</h2>
        <button mat-icon-button matTooltip="Nuova conversazione" (click)="openNewConversation()">
          <mat-icon>edit</mat-icon>
        </button>
      </div>
      <mat-divider />
      <mat-nav-list>
        <ng-container *ngFor="let conv of chatService.conversations$ | async">
          <mat-list-item
            [class.active]="(chatService.activeConversation$ | async) === conv.userId"
            (click)="openConversation(conv)">
            <div class="conv-item">
              <div class="avatar">{{ conv.username[0].toUpperCase() }}</div>
              <div class="conv-info">
                <div class="conv-top">
                  <span class="username">{{ conv.username }}</span>
                  <span class="time" *ngIf="conv.updatedAt">{{ conv.updatedAt | date:'HH:mm' }}</span>
                </div>
                <div class="conv-bottom">
                  <span class="last-msg">
                    {{ conv.lastMessage | slice:0:35 }}{{ (conv.lastMessage?.length ?? 0) > 35 ? '…' : '' }}
                  </span>
                  <span class="badge" *ngIf="conv.unreadCount > 0">{{ conv.unreadCount }}</span>
                </div>
              </div>
            </div>
          </mat-list-item>
          <mat-divider />
        </ng-container>
        <p class="empty" *ngIf="(chatService.conversations$ | async)?.length === 0">
          Nessuna conversazione
        </p>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar { height: 100%; display: flex; flex-direction: column; }
    .sidebar-header { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
    .sidebar-header h2 { margin: 0; font-size: 18px; font-weight: 500; }
    mat-nav-list { flex: 1; overflow-y: auto; padding: 0; }
    mat-list-item { cursor: pointer; height: auto !important; }
    mat-list-item:hover { background: rgba(0,0,0,0.04); }
    .active { background: rgba(63,81,181,0.1) !important; }
    .conv-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 0; }
    .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; font-size: 16px; flex-shrink: 0;
    }
    .conv-info { flex: 1; min-width: 0; }
    .conv-top { display: flex; justify-content: space-between; align-items: center; }
    .username { font-weight: 500; font-size: 14px; }
    .time { font-size: 11px; color: #888; flex-shrink: 0; }
    .conv-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 2px; }
    .last-msg { font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge {
      background: #e91e63; color: white; border-radius: 10px;
      min-width: 18px; height: 18px; font-size: 11px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px; flex-shrink: 0;
    }
    .empty { padding: 24px 16px; color: #999; text-align: center; }
  `]
})
export class ChatSidebarComponent {
  chatService = inject(ChatService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  openConversation(conv: ConversationSummary): void {
    this.chatService.activeConversation$.next(conv.userId);
    this.chatService.markAsRead(conv.userId).subscribe();
    this.chatService.mobileSidebarOpen$.next(false);
    this.router.navigate(['/chat', conv.userId]);
  }

  openNewConversation(): void {
    this.dialog.open(NewConversationDialogComponent, { width: '360px' })
      .afterClosed()
      .subscribe((user: User | undefined) => {
        if (!user) return;
        // Aggiungi la conversazione se non esiste già
        const exists = this.chatService.conversations$.value.some(c => c.userId === user.id);
        if (!exists) {
          this.chatService.conversations$.next([
            { userId: user.id, username: user.username, lastMessage: null, unreadCount: 0, updatedAt: null },
            ...this.chatService.conversations$.value,
          ]);
        }
        this.chatService.activeConversation$.next(user.id);
        this.chatService.mobileSidebarOpen$.next(false);
        this.router.navigate(['/chat', user.id]);
      });
  }
}
