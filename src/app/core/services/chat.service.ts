import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription, map } from 'rxjs';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { ChatMessage, ConversationSummary, Page } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private zone = inject(NgZone);
  private rxStomp = new RxStomp();
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private watchSub?: Subscription;

  conversations$ = new BehaviorSubject<ConversationSummary[]>([]);
  activeConversation$ = new BehaviorSubject<number | null>(null);
  messagesMap$ = new BehaviorSubject<Map<number, ChatMessage[]>>(new Map());
  newMessage$ = new Subject<ChatMessage>();
  connected$ = new BehaviorSubject<boolean>(false);
  mobileSidebarOpen$ = new BehaviorSubject<boolean>(false);

  connect(token: string, username: string): void {
    // Nuova istanza ad ogni connect per evitare conflitti con deactivate() asincrono
    this.rxStomp = new RxStomp();

    const wsUrl = environment.apiUrl.replace('/api', '') + '/ws';
    this.rxStomp.configure({
      webSocketFactory: () => new (SockJS as any)(`${wsUrl}?token=${token}`),
      connectHeaders: {},
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });
    this.rxStomp.activate();

    this.rxStomp.connectionState$.pipe(
      map(state => state === RxStompState.OPEN)
    ).subscribe(connected => this.connected$.next(connected));

    this.watchSub = this.rxStomp
      .watch(`/user/${username}/queue/messages`)
      .subscribe({
        next: (frame) => {
          try {
            const msg = JSON.parse(frame.body) as ChatMessage;
            this._onIncomingMessage(msg);
          } catch (e) {
            console.error('[Chat] Errore parsing messaggio:', e);
          }
        },
        error: (err) => console.error('[Chat] Errore sottoscrizione STOMP:', err),
      });

    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 20000);
  }

  disconnect(): void {
    clearInterval(this.heartbeatInterval);
    this.watchSub?.unsubscribe();
    this.connected$.next(false);
    this.rxStomp.deactivate();
  }

  sendMessage(recipientId: number, content: string): void {
    this.rxStomp.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ recipientId, content }),
    });
  }

  sendHeartbeat(): void {
    this.rxStomp.publish({ destination: '/app/chat.heartbeat', body: '' });
  }

  loadHistory(userId: number, messages: ChatMessage[], replace = false): void {
    const currentMap = new Map(this.messagesMap$.value);
    if (replace) {
      currentMap.set(userId, messages);
    } else {
      const existing = currentMap.get(userId) ?? [];
      currentMap.set(userId, [...messages, ...existing]);
    }
    this.messagesMap$.next(currentMap);
  }

  getConversations(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(`${environment.apiUrl}/chat/conversations`);
  }

  getHistory(userId: number, page = 0, size = 20): Observable<Page<ChatMessage>> {
    return this.http.get<Page<ChatMessage>>(
      `${environment.apiUrl}/chat/history/${userId}?page=${page}&size=${size}`
    );
  }

  markAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/chat/history/${userId}/read`, {});
  }

  private _onIncomingMessage(msg: ChatMessage): void {
    this.zone.run(() => {
      console.log('[Chat] Messaggio ricevuto:', msg);
      this.newMessage$.next(msg);

      const currentMap = new Map(this.messagesMap$.value);
      const partnerId = msg.senderId;
      currentMap.set(partnerId, [...(currentMap.get(partnerId) ?? []), msg]);
      this.messagesMap$.next(currentMap);

      const active = this.activeConversation$.value;
      const convList = this.conversations$.value;
      const existingIndex = convList.findIndex(c => c.userId === partnerId);

      let updated: ConversationSummary[];
      if (existingIndex >= 0) {
        updated = convList.map(c =>
          c.userId === partnerId
            ? {
                ...c,
                lastMessage: msg.content,
                updatedAt: msg.createdAt,
                unreadCount: active === partnerId ? 0 : c.unreadCount + 1,
              }
            : c
        );
      } else {
        updated = [
          {
            userId: partnerId,
            username: msg.senderUsername,
            lastMessage: msg.content,
            updatedAt: msg.createdAt,
            unreadCount: active === partnerId ? 0 : 1,
          },
          ...convList,
        ];
      }

      updated.sort((a, b) => {
        if (!a.updatedAt) return 1;
        if (!b.updatedAt) return -1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      this.conversations$.next(updated);
    });
  }
}
