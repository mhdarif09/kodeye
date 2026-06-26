'use client';

import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
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
import { partnersApi } from '../../../../features/partners/api';
import type { TrustedCompany, TrustedCompanyInput } from '../../../../features/partners/types';
import { getErrorMessage } from '../../../../lib/utils';

const emptyForm: TrustedCompanyInput = {
  name: '',
  logoUrl: '/kodeye-logo.png',
  websiteUrl: 'https://kodeye.id',
  sortOrder: 1,
  isActive: true,
};

export default function AdminPartnersPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth({ requireAuth: true });
  const [companies, setCompanies] = useState<TrustedCompany[]>([]);
  const [form, setForm] = useState<TrustedCompanyInput>(emptyForm);
  const [editing, setEditing] = useState<TrustedCompany | null>(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') router.replace('/dashboard');
    if (user?.role !== 'ADMIN') return;
    partnersApi
      .adminList()
      .then(setCompanies)
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
      sortOrder: companies.length + 1,
    });
    setIsModalOpen(true);
  }

  function openEdit(company: TrustedCompany) {
    setEditing(company);
    setForm({
      name: company.name,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl || '',
      sortOrder: company.sortOrder,
      isActive: company.isActive,
    });
    setIsModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editing) {
        const updated = await partnersApi.adminUpdate(editing.id, form);
        setCompanies(companies.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await partnersApi.adminCreate(form);
        setCompanies([...companies, created]);
      }
      setIsModalOpen(false);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus perusahaan klien ini?')) return;
    try {
      await partnersApi.adminDelete(id);
      setCompanies(companies.filter((c) => c.id !== id));
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Trusted Partners Management</h1>
            <p className="text-sm text-slate-500">
              Kelola logo dan nama perusahaan klien terpercaya yang ditampilkan di website.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Klien
        </Button>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="p-4">Urutan</th>
                <th className="p-4">Logo URL</th>
                <th className="p-4">Nama Perusahaan</th>
                <th className="p-4">Website Link</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-slate-900">{item.sortOrder}</td>
                  <td className="p-4 truncate max-w-[150px]">{item.logoUrl}</td>
                  <td className="p-4 font-bold text-slate-900">{item.name}</td>
                  <td className="p-4 text-xs truncate max-w-[150px] text-brand-600">
                    {item.websiteUrl || '-'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.isActive ? 'Aktif' : 'Sembunyi'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada perusahaan mitra. Klik tombol Tambah Klien di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Klien' : 'Tambah Klien'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Perusahaan</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Telkomsel Indonesia" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Logo URL</label>
            <Input required value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="/kodeye-logo.png" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Website URL</label>
            <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://telkomsel.com" />
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
