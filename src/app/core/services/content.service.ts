import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Content, ContentRequest, PageResponse } from '../models/content.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/contents`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllContents(page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(this.apiUrl, { params, headers: this.getAuthHeaders() });
  }

  getContentBySlug(slug: string): Observable<Content> {
    return this.http.get<Content>(`${this.apiUrl}/slug/${slug}`, { headers: this.getAuthHeaders() });
  }

  getContentById(id: number): Observable<Content> {
    return this.http.get<Content>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createContent(request: ContentRequest): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, request, { headers: this.getAuthHeaders() });
  }

  updateContent(id: number, request: ContentRequest): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${id}`, request, { headers: this.getAuthHeaders() });
  }

  deleteContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getContentsByCategory(categoryId: number, page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(`${this.apiUrl}/category/${categoryId}`, { params, headers: this.getAuthHeaders() });
  }

  getContentsByTag(tagId: number, page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(`${this.apiUrl}/tag/${tagId}`, { params, headers: this.getAuthHeaders() });
  }

  getContentsByAuthor(authorId: number, page: number = 0, size: number = 10): Observable<PageResponse<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Content>>(`${this.apiUrl}/author/${authorId}`, { params, headers: this.getAuthHeaders() });
  }

  uploadImage(file: File): Observable<{ response: any, media : {id : number} }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('original_filename', file.name);
    return this.http.post<{ response: any, media : {id : number} }>(`${environment.apiUrl}/media`, formData, { headers: this.getAuthHeaders() });
  }
}
