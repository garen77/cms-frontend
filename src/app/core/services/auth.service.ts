import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = sessionStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => {
          const sessionId = this.generateSessionId();
          sessionStorage.setItem('sessionId', sessionId);
          sessionStorage.setItem('token', response.token);
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role
          };
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          // Carica avatar dopo il login
          this.loadUserAvatar();
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => {
          const sessionId = this.generateSessionId();
          sessionStorage.setItem('sessionId', sessionId);
          sessionStorage.setItem('token', response.token);
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            role: response.role
          };
          sessionStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  getSessionId(): string | null {
    return sessionStorage.getItem('sessionId');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN';
  }

  isEditor(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'EDITOR';
  }

  isAuthor(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'EDITOR' || user?.role === 'AUTHOR';
  }

  canCreateContent(): boolean {
    return this.isAuthor();
  }

  canEditContent(authorId?: number): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'EDITOR') return true;
    if (user.role === 'AUTHOR' && authorId && user.id === authorId) return true;
    return false;
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.post<{ avatarUrl: string }>(`${environment.apiUrl}/users/avatar`, formData, { headers })
      .pipe(
        tap(response => {
          if (response.avatarUrl) {
            this.updateUserAvatar(response.avatarUrl);
          }
        })
      );
  }

  getAvatar(): Observable<{ avatarUrl: string | null }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<{ avatarUrl: string | null }>(`${environment.apiUrl}/users/avatar`, { headers });
  }

  deleteAvatar(): Observable<{ success: string; message: string }> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.delete<{ success: string; message: string }>(`${environment.apiUrl}/users/avatar`, { headers })
      .pipe(
        tap(() => {
          this.updateUserAvatar(null);
        })
      );
  }

  updateUserAvatar(avatarUrl: string | null): void {
    const user = this.currentUserValue;
    if (user) {
      user.avatarUrl = avatarUrl ?? undefined;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  loadUserAvatar(): void {
    if (this.isAuthenticated()) {
      this.getAvatar().subscribe({
        next: (response) => {
          this.updateUserAvatar(response.avatarUrl);
        },
        error: () => {
          // Ignora errori nel caricamento avatar
        }
      });
    }
  }
}
