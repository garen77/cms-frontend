import { Category } from './category.model';
import { Tag } from './tag.model';

export interface Media {
  id: number;
  fileUrl: string;
  originalFilename?: string;
  mimeType?: string;
}

export interface Content {
  id: number;
  title: string;
  slug: string;
  author?: Author;
  category?: Category;
  excerpt?: string;
  body: string;
  featuredImage?: Media;
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
  featuredImageId?: number;
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
