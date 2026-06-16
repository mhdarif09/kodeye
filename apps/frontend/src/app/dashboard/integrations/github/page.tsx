'use client';

import { Github, RefreshCw, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Select } from '../../../../components/ui/select';
import { Spinner } from '../../../../components/ui/spinner';
import { githubApi } from '../../../../features/github/api';
import type {
  GitHubInstallation,
  GitHubRepository,
} from '../../../../features/github/types';
import { organizationsApi } from '../../../../features/organizations/api';
import type { Organization } from '../../../../features/organizations/types';
import { getErrorMessage } from '../../../../lib/utils';

export default function GitHubIntegrationPage() {
  const router = useRouter();
  const callbackHandled = useRef(false);
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [syncingId, setSyncingId] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [installationItems, repositoryItems, organizationItems] =
        await Promise.all([
          githubApi.installations(),
          githubApi.repositories(),
          organizationsApi.list(),
        ]);
      setInstallations(installationItems);
      setRepositories(repositoryItems);
      setOrganizations(organizationItems);
      setOrganizationId((current) => current || organizationItems[0]?.id || '');
      return { installationItems, organizationItems };
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      return { installationItems: [], organizationItems: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (callbackHandled.current) return;
    callbackHandled.current = true;

    void (async () => {
      const { installationItems, organizationItems } = await loadData();
      const parameters = new URLSearchParams(window.location.search);
      const status = parameters.get('status');
      const installationId = parameters.get('installation_id');

      if (status !== 'connected' || !installationId) {
        const autoInstallOrganizationId = parameters.get('organization_id');
        const autoInstallOrganization = organizationItems.find(
          (organization) => organization.id === autoInstallOrganizationId,
        );
        if (
          parameters.get('auto_install') === 'true' &&
          installationItems.length === 0 &&
          autoInstallOrganization
        ) {
          setIsInstalling(true);
          try {
            const result = await githubApi.getInstallUrl(
              autoInstallOrganization.id,
            );
            window.location.assign(result.installUrl);
          } catch (caughtError) {
            setError(getErrorMessage(caughtError));
            setIsInstalling(false);
          }
        }
        return;
      }

      const installation = installationItems.find(
        (item) => item.installationId === installationId,
      );
      if (!installation) {
        setError('GitHub installation was connected but could not be loaded.');
        return;
      }

      setSyncingId(installationId);
      try {
        const synced = await githubApi.syncRepositories(
          installation.organizationId,
          installation.installationId,
        );
        setSuccess(`${synced.length} GitHub repositories synced successfully.`);
        await loadData();
        router.replace('/dashboard/integrations/github');
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
      } finally {
        setSyncingId('');
      }
    })();
  }, [loadData, router]);

  async function installGitHubApp() {
    setError('');
    setIsInstalling(true);
    try {
      const result = await githubApi.getInstallUrl(organizationId);
      window.location.assign(result.installUrl);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setIsInstalling(false);
    }
  }

  async function syncRepositories(installation: GitHubInstallation) {
    setError('');
    setSuccess('');
    setSyncingId(installation.installationId);
    try {
      const synced = await githubApi.syncRepositories(
        installation.organizationId,
        installation.installationId,
      );
      setSuccess(`${synced.length} GitHub repositories synced successfully.`);
      await loadData();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSyncingId('');
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            GitHub integration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Select repositories for Kodeye
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Connect your GitHub account and install the Kodeye GitHub App to
            select repositories for future security scanning.
          </p>
        </div>
        <Button
          disabled={isInstalling || organizations.length === 0}
          onClick={installGitHubApp}
        >
          <Github className="h-4 w-4" />
          {isInstalling ? 'Opening GitHub...' : 'Install GitHub App'}
        </Button>
      </div>

      <Alert className="mt-6">
        Kodeye only accesses repositories you explicitly select during GitHub
        App installation. To enable automatic scans, make sure your GitHub App
        is subscribed to Push and Pull request events and has Checks: Read &
        write permission.
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

      {organizations.length > 1 ? (
        <div className="mt-6 max-w-sm">
          <Select
            id="github-organization"
            label="Install for organization"
            onChange={(event) => setOrganizationId(event.target.value)}
            value={organizationId}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <Spinner /> Checking GitHub connection...
        </div>
      ) : installations.length === 0 ? (
        <Card className="mt-8 max-w-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Github className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-bold text-slate-950">
            GitHub is not connected
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Installing the GitHub App opens GitHub&apos;s official repository
            selection page. Kodeye never asks you to paste a personal access
            token.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {installations.map((installation) => (
            <Card key={installation.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge tone="success">Connected</Badge>
              </div>
              <h2 className="mt-5 font-bold text-slate-950">
                {installation.githubAccountLogin}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {installation.repositorySelection === 'all'
                  ? 'All repositories selected'
                  : 'Selected repositories only'}
              </p>
              <Button
                className="mt-5"
                disabled={Boolean(syncingId)}
                onClick={() => syncRepositories(installation)}
                variant="secondary"
              >
                <RefreshCw
                  className={
                    syncingId === installation.installationId
                      ? 'h-4 w-4 animate-spin'
                      : 'h-4 w-4'
                  }
                />
                {syncingId === installation.installationId
                  ? 'Syncing repositories...'
                  : 'Sync repositories'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {repositories.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-950">
            Synced GitHub repositories
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {repositories.map((repository) => (
              <Card className="p-4" key={repository.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-slate-950">
                    {repository.fullName ?? repository.name}
                  </p>
                  <Badge tone="primary">GITHUB</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
