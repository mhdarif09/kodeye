import { apiClient } from '../../lib/api-client';
import type { BlogPost, BlogPostInput } from './types';

export const blogApi = {
  adminCreate: (input: BlogPostInput) =>
    apiClient<BlogPost>('/admin/blog/posts', {
      authenticated: true,
      body: input,
      method: 'POST',
    }),
  adminDelete: (id: string) =>
    apiClient<{ deleted: boolean }>(`/admin/blog/posts/${id}`, {
      authenticated: true,
      method: 'DELETE',
    }),
  adminList: () =>
    apiClient<BlogPost[]>('/admin/blog/posts', { authenticated: true }),
  adminUpdate: (id: string, input: Partial<BlogPostInput>) =>
    apiClient<BlogPost>(`/admin/blog/posts/${id}`, {
      authenticated: true,
      body: input,
      method: 'PATCH',
    }),
  getPublished: (slug: string) =>
    apiClient<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`),
  listPublished: () => apiClient<BlogPost[]>('/blog/posts'),
};
