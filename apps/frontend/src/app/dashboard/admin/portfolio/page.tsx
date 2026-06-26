'use client';

import { FolderGit2, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Alert } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Modal } from '../../../../components/ui/modal';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { useAuth } from '../../../../features/auth/use-auth';
import { portfolioApi } from '../../../../features/portfolio/api';
import type {
  PortfolioProject,
  PortfolioProjectInput,
} from '../../../../features/portfolio/types';
import { getErrorMessage } from '../../../../lib/utils';

const emptyForm: PortfolioProjectInput = {
  category: 'Website Development',
  imageUrl: '/projects/landing-web.png',
  isActive: true,
  projectUrl: 'https://kodeye.id',
  sortOrder: 1,
  subtitle: '',
  title: '',
};

export default function AdminPortfolioPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [form, setForm] = useState<PortfolioProjectInput>(emptyForm);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    portfolioApi
      .adminList()
      .then(setProjects)
      .catch((caught) => {
        setError(getErrorMessage(caught));
      });
  }, [isLoading, router, user?.role]);

  if (isLoading) return <Spinner />;
  if (user?.role !== 'ADMIN') return null;

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      sortOrder: projects.length + 1,
    });
    setError('');
    setIsModalOpen(true);
  }

  function openEdit(project: PortfolioProject) {
    setEditing(project);
    setForm({
      category: project.category,
      imageUrl: project.imageUrl,
      isActive: project.isActive,
      projectUrl: project.projectUrl ?? '',
      sortOrder: project.sortOrder,
      subtitle: project.subtitle,
      title: project.title,
    });
    setError('');
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (editing) {
        const saved = await portfolioApi.adminUpdate(editing.id, form);
        setProjects((current) =>
          current.map((item) => (item.id === saved.id ? saved : item)),
        );
      } else {
        const created = await portfolioApi.adminCreate(form);
        setProjects((current) => [created, ...current]);
      }
      setIsModalOpen(false);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this project card?'))
      return;
    try {
      await portfolioApi.adminDelete(id);
      setProjects((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Admin</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 flex items-center gap-3">
            <FolderGit2 className="h-8 w-8 text-brand-600" />
            Our Projects Portfolio
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage portfolio project cards displayed on the main landing page.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-4">Image</th>
                <th className="pb-4">Title & Subtitle</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Order</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50">
                  <td className="py-4 font-mono text-xs text-slate-500">
                    <span className="inline-block px-2 py-1 bg-slate-100 rounded border">
                      {project.imageUrl}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-slate-950">
                      {project.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.subtitle}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                      {project.category}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-xs">{project.sortOrder}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {project.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <Button
                      onClick={() => openEdit(project)}
                      className="min-h-8 px-3 py-1.5 text-xs"
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(project.id)}
                      className="min-h-8 px-3 py-1.5 text-xs"
                      variant="secondary"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 ? (
                <tr>
                  <td
                    className="py-8 text-center text-slate-500 text-sm"
                    colSpan={6}
                  >
                    No portfolio projects found. Click &quot;New Project&quot; to create one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit project card' : 'New project card'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="project-title"
              label="Title"
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Website Development"
              required
              value={form.title}
            />
            <Input
              id="project-subtitle"
              label="Subtitle"
              maxLength={255}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subtitle: event.target.value,
                }))
              }
              placeholder="e.g. Corporate Landing Page & E-Commerce"
              required
              value={form.subtitle}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="project-category"
              label="Category Badge"
              maxLength={100}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              placeholder="e.g. Website Development"
              required
              value={form.category}
            />
            <Input
              id="project-image-url"
              label="Image URL Path"
              maxLength={2048}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              placeholder="e.g. /projects/landing-web.png or https://..."
              required
              value={form.imageUrl}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              id="project-url"
              label="External Project Link"
              maxLength={2048}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  projectUrl: event.target.value,
                }))
              }
              placeholder="https://kodeye.id"
              value={form.projectUrl ?? ''}
            />
            <Input
              id="project-order"
              label="Sort Order"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0,
                }))
              }
              type="number"
              value={String(form.sortOrder)}
            />
            <Select
              id="project-status"
              label="Visibility Status"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.value === 'true',
                }))
              }
              value={String(form.isActive)}
            >
              <option value="true">Active (Visible)</option>
              <option value="false">Hidden</option>
            </Select>
          </div>

          <Button disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
