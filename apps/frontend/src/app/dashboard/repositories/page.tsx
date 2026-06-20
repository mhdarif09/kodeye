'use client';

import { ExternalLink, Plus, SquareCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useState } from 'react';

import { EmptyState } from '../../../components/empty-state';
import { Alert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { Select } from '../../../components/ui/select';
import { Spinner } from '../../../components/ui/spinner';
import { organizationsApi } from '../../../features/organizations/api';
import type { Organization } from '../../../features/organizations/types';
import { repositoriesApi } from '../../../features/repositories/api';
import type { Repository } from '../../../features/repositories/types';
import { scansApi } from '../../../features/scans/api';
import { formatDate, getErrorMessage } from '../../../lib/utils';

const initialForm = {
  organizationId: '',
  name: '',
  repoUrl: '',
  defaultBranch: 'main',
  isPrivate: false,
};

type ManualMode = 'public-url' | 'upload';

export default function RepositoriesPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualMode, setManualMode] = useState<ManualMode>('public-url');
  const [scanningId, setScanningId] = useState('');
  const [updatingAutomationId, setUpdatingAutomationId] = useState('');

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [repositoryItems, loadedOrganizationItems] = await Promise.all([
        repositoriesApi.list(),
        organizationsApi.list(),
      ]);
      let organizationItems = loadedOrganizationItems;
      if (organizationItems.length === 0) {
        const created = await organizationsApi.create('My Organization');
        organizationItems = [created];
      }
      setRepositories(repositoryItems);
      setOrganizations(organizationItems);
      setForm((current) => ({
        ...current,
        organizationId:
          current.organizationId || organizationItems[0]?.id || '',
      }));
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!isPublicGitHubUrl(form.repoUrl)) {
      setError(
        'Manual scans currently require a public GitHub repository URL. Use the GitHub App for private repositories.',
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const repository = await repositoriesApi.create({
        ...form,
        isPrivate: false,
        repoUrl: form.repoUrl,
      });
      setRepositories((items) => [repository, ...items]);
      setForm({ ...initialForm, organizationId: form.organizationId });
      setIsModalOpen(false);
      setSuccess('Repository metadata added successfully.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function startScan(repository: Repository) {
    setError('');
    setScanningId(repository.id);
    try {
      const scan = await scansApi.createScan(repository.id, {
        branch: repository.defaultBranch,
      });
      router.push(`/dashboard/scans/${scan.id}`);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setScanningId('');
    }
  }

  async function updateAutomation(
    repository: Repository,
    key: 'autoScanPushEnabled' | 'autoScanPullRequestEnabled',
    value: boolean,
  ) {
    setError('');
    setUpdatingAutomationId(repository.id);
    try {
      const updated = await repositoriesApi.updateAutomationSettings(
        repository.id,
        {
          autoScanPullRequestEnabled:
            key === 'autoScanPullRequestEnabled'
              ? value
              : repository.autoScanPullRequestEnabled,
          autoScanPushEnabled:
            key === 'autoScanPushEnabled'
              ? value
              : repository.autoScanPushEnabled,
        },
      );
      setRepositories((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSuccess('Repository automation settings updated.');
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setUpdatingAutomationId('');
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">Repositories</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Repository inventory
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Keep the codebases you plan to review in one clear inventory.
          </p>
        </div>
        <Button
          disabled={organizations.length === 0}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add repository
        </Button>
      </div>

      <Alert className="mt-6">
        Manual scans currently support public GitHub repository URLs only.
        Private repositories should be connected through the GitHub App.
        ZIP/folder upload will use a separate artifact scanning flow.
      </Alert>
      {error ? (
        <Alert className="mt-4" tone="error">
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert className="mt-4" tone="success">
          {success}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <Spinner /> Loading repositories...
        </div>
      ) : repositories.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            action={
              organizations.length > 0 ? (
                <Button onClick={() => setIsModalOpen(true)}>
                  Add repository
                </Button>
              ) : undefined
            }
            description={
              organizations.length > 0
                ? 'Add repository metadata manually to prepare your first review.'
                : 'Create an organization first, then add repository metadata.'
            }
            icon={SquareCode}
            title="No repositories yet"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {repositories.map((repository) => (
            <Card key={repository.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-bold text-slate-950">
                    {repository.fullName ?? repository.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Added {formatDate(repository.createdAt)}
                  </p>
                </div>
                <Badge tone="primary">{repository.provider}</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge>{repository.defaultBranch}</Badge>
                <Badge tone={repository.isPrivate ? 'warning' : 'success'}>
                  {repository.isPrivate ? 'Private' : 'Public'}
                </Badge>
              </div>
              {repository.htmlUrl || repository.repoUrl ? (
                <a
                  className="mt-5 inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-brand-600 hover:text-brand-700"
                  href={repository.htmlUrl ?? repository.repoUrl ?? '#'}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {repository.htmlUrl ?? repository.repoUrl}
                  </span>
                </a>
              ) : (
                <p className="mt-5 text-sm text-slate-400">
                  No repository URL provided.
                </p>
              )}
              {repository.provider === 'GITHUB' ? (
                <>
                  <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Automatic scans
                    </p>
                    {[
                      ['autoScanPushEnabled', 'Auto scan on push'],
                      [
                        'autoScanPullRequestEnabled',
                        'Auto scan on pull request',
                      ],
                    ].map(([key, label]) => (
                      <label
                        className="flex items-center justify-between gap-3 text-sm text-slate-700"
                        key={key}
                      >
                        {label}
                        <input
                          checked={Boolean(repository[key as keyof Repository])}
                          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          disabled={
                            updatingAutomationId === repository.id ||
                            !repository.isConnected
                          }
                          onChange={(event) =>
                            void updateAutomation(
                              repository,
                              key as
                                | 'autoScanPushEnabled'
                                | 'autoScanPullRequestEnabled',
                              event.target.checked,
                            )
                          }
                          type="checkbox"
                        />
                      </label>
                    ))}
                  </div>
                  {!repository.isConnected ? (
                    <Alert className="mt-4" tone="error">
                      This repository is no longer connected to the GitHub App.
                    </Alert>
                  ) : null}
                  <Button
                    className="mt-5 w-full"
                    disabled={Boolean(scanningId) || !repository.isConnected}
                    onClick={() => startScan(repository)}
                  >
                    {scanningId === repository.id
                      ? 'Creating scan job...'
                      : 'Start Scan'}
                  </Button>
                </>
              ) : !repository.isPrivate &&
                isPublicGitHubUrl(repository.repoUrl) ? (
                <>
                  <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-500">
                    Public GitHub repository ready for manual audit.
                  </p>
                  <Button
                    className="mt-5 w-full"
                    disabled={Boolean(scanningId)}
                    onClick={() => startScan(repository)}
                  >
                    {scanningId === repository.id
                      ? 'Creating scan job...'
                      : 'Start Scan'}
                  </Button>
                </>
              ) : (
                <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-500">
                  Manual scans require a public GitHub repository URL. Use the
                  GitHub App for private repositories.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        description="Manual scans support public GitHub repository URLs. Private repositories use the GitHub App. ZIP/folder upload is the next artifact flow."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add repository"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={
                manualMode === 'public-url'
                  ? 'rounded-xl border border-brand-500 bg-brand-50 p-4 text-left ring-4 ring-brand-100'
                  : 'rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-brand-200'
              }
              onClick={() => setManualMode('public-url')}
              type="button"
            >
              <p className="font-bold text-slate-950">Public repo URL</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Ready now. Clone and scan a public GitHub repository.
              </p>
            </button>
            <button
              className={
                manualMode === 'upload'
                  ? 'rounded-xl border border-amber-400 bg-amber-50 p-4 text-left ring-4 ring-amber-100'
                  : 'rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-amber-200'
              }
              onClick={() => setManualMode('upload')}
              type="button"
            >
              <p className="font-bold text-slate-950">Upload ZIP/folder</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Coming next. Needs artifact upload and extraction pipeline.
              </p>
            </button>
          </div>
          {manualMode === 'upload' ? (
            <Alert tone="info">
              ZIP/folder upload is not enabled yet. For now, use a public GitHub
              URL or connect private code through the GitHub App.
            </Alert>
          ) : null}
          <Select
            id="repository-organization"
            label="Organization"
            disabled={manualMode === 'upload'}
            onChange={(event) =>
              setForm({ ...form, organizationId: event.target.value })
            }
            required
            value={form.organizationId}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
          <Input
            id="repository-name"
            label="Repository name"
            disabled={manualMode === 'upload'}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="studentcare-api"
            required
            value={form.name}
          />
          <Input
            id="repository-url"
            label="Public GitHub repository URL"
            disabled={manualMode === 'upload'}
            onChange={(event) =>
              setForm({ ...form, repoUrl: event.target.value })
            }
            placeholder="https://github.com/example/repository"
            required
            type="url"
            value={form.repoUrl}
          />
          <Input
            id="default-branch"
            label="Default branch"
            disabled={manualMode === 'upload'}
            onChange={(event) =>
              setForm({ ...form, defaultBranch: event.target.value })
            }
            required
            value={form.defaultBranch}
          />
          <Alert>
            Manual URL scans are public-only. For private code, install the
            Kodeye GitHub App so access stays scoped and auditable.
          </Alert>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || manualMode === 'upload'}
              type="submit"
            >
              {isSubmitting ? 'Adding...' : 'Add repository'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function isPublicGitHubUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.toLowerCase() === 'github.com' &&
      !url.username &&
      !url.password &&
      /^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
