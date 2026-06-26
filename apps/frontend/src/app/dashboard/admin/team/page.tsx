'use client';

import { Plus, Trash2, UsersRound } from 'lucide-react';
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
import { teamApi } from '../../../../features/team/api';
import type { TeamMember, TeamMemberInput } from '../../../../features/team/types';
import { getErrorMessage } from '../../../../lib/utils';

const emptyForm: TeamMemberInput = {
  name: '',
  role: 'AI Engineer',
  description: '',
  photoUrl: '/hero-girl.jpg',
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com',
  instagramUrl: 'https://instagram.com',
  sortOrder: 1,
  isActive: true,
};

export default function AdminTeamPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<TeamMemberInput>(emptyForm);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    teamApi
      .adminList()
      .then(setMembers)
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
      sortOrder: members.length + 1,
    });
    setIsModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      description: member.description,
      photoUrl: member.photoUrl,
      linkedinUrl: member.linkedinUrl || '',
      githubUrl: member.githubUrl || '',
      instagramUrl: member.instagramUrl || '',
      sortOrder: member.sortOrder,
      isActive: member.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editing) {
        const updated = await teamApi.adminUpdate(editing.id, form);
        setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        const created = await teamApi.adminCreate(form);
        setMembers([...members, created]);
      }
      setIsModalOpen(false);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus anggota tim ini?')) return;
    try {
      await teamApi.adminDelete(id);
      setMembers(members.filter((m) => m.id !== id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Our Team Management</h1>
            <p className="text-sm text-slate-500">
              Kelola foto profil, nama, jabatan, dan tautan media sosial tim di halaman About Us.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Member
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4">Urutan</th>
                <th className="p-4">Foto URL</th>
                <th className="p-4">Nama & Role</th>
                <th className="p-4">Media Sosial</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">{item.sortOrder}</td>
                  <td className="p-4 truncate max-w-[150px]">{item.photoUrl}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-xs text-brand-600">{item.role}</div>
                  </td>
                  <td className="p-4 text-xs space-y-1">
                    {item.linkedinUrl && <div className="truncate max-w-[150px]">LI: {item.linkedinUrl}</div>}
                    {item.githubUrl && <div className="truncate max-w-[150px]">GH: {item.githubUrl}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.isActive ? 'Aktif' : 'Sembunyi'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="secondary" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="danger" className="min-h-8 px-3 py-1.5 text-xs" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada anggota tim. Klik tombol Tambah Member di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Member' : 'Tambah Member'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Member</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Santoso" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jabatan / Role</label>
              <Input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Lead AI Architect" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Foto Profile URL</label>
            <Input required value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} placeholder="/hero-girl.jpg" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
            <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Arsitek utama sistem kecerdasan buatan..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">LinkedIn Link</label>
              <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/..." />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GitHub Link</label>
              <Input value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Urutan Tampil</label>
              <Input type="number" required value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
              <Select value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Aktif (Tampilkan)</option>
                <option value="false">Sembunyi</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
