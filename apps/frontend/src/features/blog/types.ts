export type BlogPostStatus = 'DRAFT' | 'PUBLISHED';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string } | null;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  status: BlogPostStatus;
  metaTitle?: string;
  metaDescription?: string;
}
