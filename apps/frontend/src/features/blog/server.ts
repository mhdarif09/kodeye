import { getApiUrl } from '../../lib/api-client';
import type { ApiSuccessResponse } from '../../types/api';
import type { BlogPost } from './types';

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  return fetchBlog<BlogPost[]>('/blog/posts');
}

export async function getPublishedBlogPost(slug: string): Promise<BlogPost> {
  return fetchBlog<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`);
}

async function fetchBlog<T>(path: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Blog API returned ${response.status}`);
  }
  const payload = (await response.json()) as ApiSuccessResponse<T>;
  if (!payload.success) {
    throw new Error(payload.message || 'Blog API returned an error');
  }
  return payload.data;
}
