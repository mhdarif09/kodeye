'use client';

import { Building2, Plus } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { EmptyState } from '../../../components/empty-state';
import { Alert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { Spinner } from '../../../components/ui/spinner';
import { organizationsApi } from '../../../features/organizations/api';
import type { Organization } from '../../../features/organizations/types';
import { formatDate, getErrorMessage } from '../../../lib/utils';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setError('');
    try {
      setOrganizations(await organizationsApi.list());
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const organization = await organizationsApi.create(name);
      setOrganizations((items) => [organization, ...items]);
      setName('');
      setIsModalOpen(false);
      setSuccess('Organization created successfully.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Organizations</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Your workspaces
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Group repositories by team, project, or security ownership.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> New organization
        </Button>
      </div>

      {error ? (
        <Alert className="mt-6" tone="error">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert className="mt-6" tone="success">
          {success}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <Spinner /> Loading organizations...
        </div>
      ) : organizations.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                Create organization
              </Button>
            }
            description="Create a workspace before adding repository metadata."
            icon={Building2}
            title="No organizations yet"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organizations.map((organization) => (
            <Card key={organization.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge tone="primary">Accessible</Badge>
              </div>
              <h2 className="mt-5 truncate font-bold text-slate-950">
                {organization.name}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Created {formatDate(organization.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        description="A workspace keeps related repositories organized."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create organization"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            autoFocus
            id="organization-name"
            label="Organization name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Acme Engineering"
            required
            value={name}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating...' : 'Create organization'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
