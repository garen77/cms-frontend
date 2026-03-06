import {
  Component, inject, OnInit, OnDestroy, ViewChild,
  ElementRef, AfterViewChecked, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, filter } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatIconModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatDividerModule
  ],
  template: `
    <div class="window" *ngIf="recipientId; else noChat">
      <div class="win-header">
        <div class="win-avatar">{{ recipientUsername[0] }}</div>
        <span class="win-username">{{ recipientUsername || '...' }}</span>
      </div>
      <mat-divider />

      <div class="messages-area" #messagesArea>
        <div class="load-more" *ngIf="hasMorePages">
          <button mat-button (click)="loadMore()">Carica messaggi precedenti</button>
        </div>
        <div
          *ngFor="let msg of messages; trackBy: trackById"
          class="msg-row"
          [class.own]="msg.senderId === currentUserId">
          <div class="bubble">
            <span class="content">{{ msg.content }}</span>
            <div class="meta">
              <span class="time">{{ msg.createdAt | date:'HH:mm' }}</span>
              <mat-icon class="read-icon" *ngIf="msg.senderId === currentUserId">
                {{ msg.isRead ? 'done_all' : 'done' }}
              </mat-icon>
            </div>
          </div>
        </div>
      </div>

      <mat-divider />
      <div class="input-bar">
        <mat-form-field appearance="outline" class="msg-field">
          <textarea
            matInput
            [(ngModel)]="messageText"
            placeholder="Scrivi un messaggio…"
            rows="1"
            (keydown)="onKeydown($event)">
          </textarea>
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="send()" [disabled]="!messageText.trim()">
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>

    <ng-template #noChat>
      <div class="no-chat">
        <mat-icon>chat_bubble_outline</mat-icon>
        <p>Seleziona una conversazione</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .window { height: 100%; display: flex; flex-direction: column; }
    .win-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
    .win-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #3f51b5; color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: bold; flex-shrink: 0;
    }
    .win-username { font-weight: 500; font-size: 16px; }
    .messages-area {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .load-more { text-align: center; margin-bottom: 8px; }
    .msg-row { display: flex; }
    .msg-row.own { justify-content: flex-end; }
    .bubble {
      max-width: 65%; padding: 8px 12px;
      border-radius: 12px; background: #e0e0e0; color: #212121;
    }
    .msg-row.own .bubble { background: #3f51b5; color: white; }
    .content { word-break: break-word; font-size: 14px; white-space: pre-wrap; }
    .meta { display: flex; align-items: center; justify-content: flex-end; gap: 2px; margin-top: 2px; }
    .time { font-size: 10px; opacity: 0.7; }
    .read-icon { font-size: 14px; width: 14px; height: 14px; opacity: 0.8; }
    .input-bar { display: flex; align-items: center; padding: 8px 16px; gap: 8px; }
    .msg-field { flex: 1; }
    .no-chat {
      height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: center; color: #999; gap: 8px;
    }
    .no-chat mat-icon { font-size: 48px; width: 48px; height: 48px; }
  `]
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesArea') messagesArea!: ElementRef<HTMLDivElement>;

  chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  recipientId: number | null = null;
  recipientUsername = '';
  messageText = '';
  messages: ChatMessage[] = [];
  currentUserId: number | null = null;
  hasMorePages = false;

  private currentPage = 0;
  private shouldScroll = false;
  private subs = new Subscription();

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue?.id ?? null;

    // Aggiorna username se le conversazioni arrivano dopo
    this.subs.add(
      this.chatService.conversations$.subscribe(convs => {
        if (this.recipientId) {
          const conv = convs.find(c => c.userId === this.recipientId);
          if (conv) this.recipientUsername = conv.username;
        }
      })
    );

    // Cambiamento route param → carica nuova conversazione
    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const uid = params.get('userId');
        if (uid) {
          this.recipientId = +uid;
          this.currentPage = 0;
          this.messages = [];
          this.chatService.activeConversation$.next(this.recipientId);
          this._loadHistory(0);
          const conv = this.chatService.conversations$.value.find(c => c.userId === this.recipientId);
          if (conv) this.recipientUsername = conv.username;
        }
      })
    );

    // Messaggi in tempo reale via Subject — garantisce change detection
    this.subs.add(
      this.chatService.newMessage$.pipe(
        filter(msg => msg.senderId === this.recipientId)
      ).subscribe(msg => {
        this.messages = [...this.messages, msg];
        this.shouldScroll = true;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this._scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.chatService.activeConversation$.next(null);
  }

  trackById(_: number, msg: ChatMessage): number {
    return msg.id;
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  send(): void {
    if (!this.messageText.trim() || !this.recipientId) return;

    const content = this.messageText.trim();
    this.messageText = '';

    const optimistic: ChatMessage = {
      id: -Date.now(),
      senderId: this.currentUserId!,
      senderUsername: this.authService.currentUserValue?.username ?? '',
      recipientId: this.recipientId,
      recipientUsername: this.recipientUsername,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.messages = [...this.messages, optimistic];
    this.shouldScroll = true;

    try {
      this.chatService.sendMessage(this.recipientId, content);
    } catch {
      this.messages = this.messages.filter(m => m.id !== optimistic.id);
      this.snackBar.open('Errore invio messaggio. Riprova.', 'OK', { duration: 3000 });
    }
  }

  loadMore(): void {
    this._loadHistory(this.currentPage + 1);
  }

  private _loadHistory(page: number): void {
    if (!this.recipientId) return;
    this.chatService.getHistory(this.recipientId, page).subscribe({
      next: response => {
        this.currentPage = response.number;
        this.hasMorePages = response.number < response.totalPages - 1;
        this.messages = page === 0
          ? response.content
          : [...response.content, ...this.messages];
        this.shouldScroll = page === 0;
        this.chatService.markAsRead(this.recipientId!).subscribe();
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Errore caricamento messaggi', 'OK', { duration: 3000 })
    });
  }

  private _scrollToBottom(): void {
    try {
      const el = this.messagesArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* ignore */ }
  }
}
