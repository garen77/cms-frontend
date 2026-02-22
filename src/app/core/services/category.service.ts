import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(name: string, slug: string, description?: string): Observable<Category> {
    const params: any = { name, slug };
    if (description) params.description = description;
    return this.http.post<Category>(this.apiUrl, null, { params });
  }

  updateCategory(id: number, name: string, slug: string, description?: string): Observable<Category> {
    const params: any = { name, slug };
    if (description) params.description = description;
    return this.http.put<Category>(`${this.apiUrl}/${id}`, null, { params });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
