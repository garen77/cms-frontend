// FILE: src/app/core/models/user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}

// FILE: src/app/core/models/content.model.ts
import { Category } from './category.model';
import { Tag } from './tag.model';

export interface Content {
  id: number;
  title: string;
  slug: string;
  author?: Author;
  category?: Category;
  excerpt?: string;
  body: string;
  featuredImage?: string;
  status: string;
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
}

export interface Author {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface ContentRequest {
  title: string;
  slug: string;
  categoryId?: number;
  excerpt?: string;
  body: string;
  featuredImage?: string;
  status: string;
  tags: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// FILE: src/app/core/models/category.model.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// FILE: src/app/core/models/tag.model.ts
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// FILE: src/app/core/models/comment.model.ts
export interface Comment {
  id: number;
  authorName?: string;
  body: string;
  status: string;
  createdAt: Date;
}

export interface CommentRequest {
  contentId: number;
  authorName?: string;
  authorEmail?: string;
  body: string;
}
