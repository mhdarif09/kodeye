'use client';

import { FileText, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Modal } from '../../../../components/ui/modal';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { Textarea } from '../../../../components/ui/textarea';
import { useAuth } from '../../../../features/auth/use-auth';
import { blogApi } from '../../../../features/blog/api';
import type {
  BlogPost,
  BlogPostInput,
  BlogPostStatus,
} from '../../../../features/blog/types';
import { formatDate, getErrorMessage } from '../../../../lib/utils';

const emptyForm: BlogPostInput = {
  content: '',
  excerpt: '',
  metaDescription: '',
  metaTitle: '',
  slug: '',
  status: 'DRAFT',
  title: '',
};

export default function AdminBlogPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPostInput>(emptyForm);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    blogApi
      .adminList()
      .then(setPosts)
      .catch((caught) => {
        setError(getErrorMessage(caught));
      });
  }, [isLoading, router, user?.role]);

  if (isLoading) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditing(post);
    setForm({
      content: post.content,
      excerpt: post.excerpt,
      metaDescription: post.metaDescription ?? '',
      metaTitle: post.metaTitle ?? '',
      slug: post.slug,
      status: post.status,
      title: post.title,
    });
    setIsModalOpen(true);
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        metaDescription: form.metaDescription?.trim() || undefined,
        metaTitle: form.metaTitle?.trim() || undefined,
        slug: form.slug?.trim() || undefined,
      };
      const saved = editing
        ? await blogApi.adminUpdate(editing.id, payload)
        : await blogApi.adminCreate(payload);
      setPosts((items) =>
        editing
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...items],
      );
      setIsModalOpen(false);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    setError('');
    try {
      await blogApi.adminDelete(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Admin Blog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Blog management
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Add, update, publish, unpublish, and delete public blog content.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-600">
                  <FileText className="h-4 w-4" />
                  {post.status}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {post.excerpt}
                </p>
                <p className="mt-2 font-mono text-xs text-slate-400">
                  /blog/{post.slug} - updated {formatDate(post.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => openEdit(post)} variant="secondary">
                  Edit
                </Button>
                <Button onClick={() => void deletePost(post)} variant="danger">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {posts.length === 0 ? (
          <Card className="text-sm text-slate-500">No blog posts yet.</Card>
        ) : null}
      </div>

      <Modal
        description="Content is rendered as text/markdown-like paragraphs, not raw HTML."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit post' : 'New post'}
        wide
      >
        <form className="space-y-4" onSubmit={(event) => void savePost(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="blog-title"
              label="Title"
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={form.title}
            />
            <Input
              id="blog-slug"
              label="Slug"
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder="auto-generated-from-title"
              value={form.slug}
            />
          </div>
          <Textarea
            id="blog-excerpt"
            label="Excerpt"
            maxLength={500}
            minLength={20}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                excerpt: event.target.value,
              }))
            }
            required
            value={form.excerpt}
          />
          <Textarea
            className="min-h-64 font-mono"
            id="blog-content"
            label="Content"
            maxLength={100000}
            minLength={50}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            required
            value={form.content}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Select
              id="blog-status"
              label="Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as BlogPostStatus,
                }))
              }
              value={form.status}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
            <Input
              id="blog-meta-title"
              label="Meta title"
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  metaTitle: event.target.value,
                }))
              }
              value={form.metaTitle}
            />
            <Input
              id="blog-meta-description"
              label="Meta description"
              maxLength={500}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  metaDescription: event.target.value,
                }))
              }
              value={form.metaDescription}
            />
          </div>
          <Button disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save post'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
