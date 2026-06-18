'use client';

import {
  CheckCircle2,
  Github,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import {
  type ComponentType,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { GlobalLoadingScreen } from '../../components/layout/global-loading-screen';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { githubApi } from '../../features/github/api';
import type {
  GitHubInstallation,
  GitHubRepository,
} from '../../features/github/types';
import { organizationsApi } from '../../features/organizations/api';
import type { Organization } from '../../features/organizations/types';
import { useAuth } from '../../features/auth/use-auth';
import {
  completeOnboarding,
  getAuthSource,
  isOnboardingCompleted,
} from '../../lib/auth-token';
import { getErrorMessage } from '../../lib/utils';

const sourceOptions = [
  'Google Search',
  'GitHub',
  'LinkedIn',
  'Friend or colleague',
  'Kodeye sales team',
  'Community or event',
  'Other',
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackHandled = useRef(false);
  const { isLoading: isAuthLoading, user } = useAuth({ requireAuth: true });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState('');
  const [startMethod, setStartMethod] = useState<
    'github' | 'manual' | 'services'
  >('github');
  const [authSource, setAuthSourceState] = useState<'email' | 'github'>(
    'email',
  );
  const isGitHubAuth = authSource === 'github';

  const selectedInstallation = useMemo(
    () =>
      installations.find(
        (installation) => installation.organizationId === organizationId,
      ),
    [installations, organizationId],
  );
  const selectedOrganization = organizations.find(
    (organization) => organization.id === organizationId,
  );
  const hasSyncedRepositories = repositories.some(
    (repository) =>
      !organizationId || repository.organizationId === organizationId,
  );
  const syncedRepositoryCount = repositories.filter(
    (repository) =>
      !organizationId || repository.organizationId === organizationId,
  ).length;
  const onboardingDone = isOnboardingCompleted();

  const loadData = useCallback(async () => {
    setError('');
    try {
      let [organizationItems, installationItems, repositoryItems] =
        await Promise.all([
          organizationsApi.list(),
          githubApi.installations(),
          githubApi.repositories(),
        ]);
      if (organizationItems.length === 0) {
        const created = await organizationsApi.create('My Organization');
        organizationItems = [created];
      }
      const preferredOrganizationId =
        searchParams.get('organization_id') ||
        organizationId ||
        organizationItems[0]?.id ||
        '';
      setOrganizations(organizationItems);
      setInstallations(installationItems);
      setRepositories(repositoryItems);
      setOrganizationId(preferredOrganizationId);
      return {
        installationItems,
        organizationId: preferredOrganizationId,
        repositoryItems,
      };
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      return {
        installationItems: [],
        organizationId: '',
        repositoryItems: [],
      };
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, searchParams]);

  const syncInstallation = useCallback(
    async (installation: GitHubInstallation) => {
      setError('');
      setSuccess('');
      setSyncingId(installation.installationId);
      try {
        const synced = await githubApi.syncRepositories(
          installation.organizationId,
          installation.installationId,
        );
        if (synced.length === 0) {
          setError(
            'No repositories were synced. Choose at least one repository for the Kodeye GitHub App, then return here.',
          );
        } else {
          setSuccess(
            `${synced.length} GitHub repositories synced successfully.`,
          );
        }
        await loadData();
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
      } finally {
        setSyncingId('');
      }
    },
    [loadData],
  );

  useEffect(() => {
    if (isAuthLoading || !user || callbackHandled.current) return;
    callbackHandled.current = true;
    setAuthSourceState(getAuthSource() ?? 'email');

    void (async () => {
      const data = await loadData();
      const installationId = searchParams.get('installation_id');
      const synced = searchParams.get('synced');
      const syncError = searchParams.get('sync_error');

      if (syncError) {
        setError(syncError);
        window.history.replaceState({}, '', '/onboarding');
        return;
      }

      if (installationId && synced !== null) {
        setSuccess(`${synced} GitHub repositories synced successfully.`);
        window.history.replaceState({}, '', '/onboarding');
        await loadData();
        return;
      }

      const installationNeedingSync = data.installationItems.find(
        (installation) =>
          installation.organizationId === data.organizationId &&
          !data.repositoryItems.some(
            (repository) => repository.organizationId === data.organizationId,
          ),
      );
      if (installationNeedingSync) {
        await syncInstallation(installationNeedingSync);
      }
    })();
  }, [isAuthLoading, loadData, searchParams, syncInstallation, user]);

  useEffect(() => {
    if (isAuthLoading || isLoading || !user) return;
    if (onboardingDone) router.replace('/dashboard');
  }, [
    isAuthLoading,
    isLoading,
    onboardingDone,
    router,
    user,
  ]);

  async function connectGitHubApp() {
    if (!organizationId) return;
    setError('');
    setIsConnecting(true);
    try {
      const result = await githubApi.getInstallUrl(
        organizationId,
        'onboarding',
      );
      window.location.assign(result.installUrl);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setIsConnecting(false);
    }
  }

  function finishOnboarding() {
    completeOnboarding(source || 'Not specified');
    router.replace('/dashboard');
  }

  function continueToManualRepository() {
    completeOnboarding('Manual repository');
    router.push('/dashboard/repositories');
  }

  function continueToServices() {
    completeOnboarding('Services');
    router.push('/services');
  }

  if (isAuthLoading || isLoading || !user) {
    return <GlobalLoadingScreen message="Preparing your setup..." />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              Kodeye
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Set up your first codebase audit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              You are signed in as {user.email}.{' '}
              {isGitHubAuth
                ? 'Finish authorizing the Kodeye GitHub App, choose repositories, and we will sync them automatically.'
                : 'Connect GitHub for the fastest audit flow, add a public repository manually, or start with an engineering service request.'}
            </p>
          </div>
          <Button onClick={() => router.replace('/dashboard')} variant="ghost">
            Skip for now
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

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <Card className="h-fit">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              Setup flow
            </p>
            <div className="mt-6 grid gap-4">
              <Step
                active
                complete
                description={
                  isGitHubAuth
                    ? 'GitHub sign in is complete.'
                    : 'Email sign in is complete.'
                }
                title="Sign in"
              />
              <Step
                active={!hasSyncedRepositories}
                complete={hasSyncedRepositories}
                description="Install the Kodeye GitHub App and choose repositories."
                title="Connect repositories"
              />
              <Step
                active={hasSyncedRepositories}
                complete={onboardingDone}
                description="Tell us where you discovered Kodeye."
                title="Finish onboarding"
              />
            </div>
          </Card>

          {!hasSyncedRepositories ? (
            <Card>
              {isGitHubAuth ? (
                <>
                  <h2 className="text-xl font-bold text-slate-950">
                    Finish GitHub setup
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    You already signed in with GitHub. The next step is
                    authorizing the Kodeye GitHub App, choosing repositories,
                    and letting Kodeye sync them automatically.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-950">
                    How do you want to start?
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    GitHub gives the best audit experience. Manual and service
                    options are available when the user is not ready to install
                    the GitHub App yet.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <StartMethodButton
                      active={startMethod === 'github'}
                      description="Install the GitHub App and auto-sync selected repositories."
                      icon={Github}
                      onClick={() => setStartMethod('github')}
                      title="Connect GitHub"
                    />
                    <StartMethodButton
                      active={startMethod === 'manual'}
                      description="Scan a public GitHub URL now. ZIP/folder upload is the next artifact flow."
                      icon={UploadCloud}
                      onClick={() => setStartMethod('manual')}
                      title="Manual repository"
                    />
                    <StartMethodButton
                      active={startMethod === 'services'}
                      description="Talk to Kodeye about automation, DevOps, or website work."
                      icon={Rocket}
                      onClick={() => setStartMethod('services')}
                      title="Need services"
                    />
                  </div>
                </>
              )}

              {isGitHubAuth || startMethod === 'github' ? (
                <>
                  <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Github className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    Choose your GitHub account and repositories
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This opens GitHub only for the official account/repository
                    selection step. After install or update, GitHub redirects
                    back to this onboarding page and Kodeye syncs automatically.
                  </p>

                  {organizations.length > 1 ? (
                    <div className="mt-6 max-w-sm">
                      <Select
                        id="onboarding-organization"
                        label="Kodeye organization"
                        onChange={(event) =>
                          setOrganizationId(event.target.value)
                        }
                        value={organizationId}
                      >
                        {organizations.map((organization) => (
                          <option key={organization.id} value={organization.id}>
                            {organization.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      Organization: {selectedOrganization?.name ?? 'Default'}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      disabled={isConnecting || !organizationId}
                      onClick={connectGitHubApp}
                    >
                      <Github className="h-4 w-4" />
                      {selectedInstallation
                        ? 'Choose repositories again'
                        : 'Install GitHub App'}
                    </Button>
                    {selectedInstallation ? (
                      <Button
                        disabled={Boolean(syncingId)}
                        onClick={() => syncInstallation(selectedInstallation)}
                        variant="secondary"
                      >
                        <RefreshCw
                          className={
                            syncingId === selectedInstallation.installationId
                              ? 'h-4 w-4 animate-spin'
                              : 'h-4 w-4'
                          }
                        />
                        Sync again
                      </Button>
                    ) : null}
                  </div>

                  {syncingId ? (
                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing selected repositories...
                    </div>
                  ) : null}
                </>
              ) : null}

              {startMethod === 'manual' ? (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">
                    Start with a public repository
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Manual scanning currently accepts public GitHub repository
                    URLs. Private repositories should use the GitHub App.
                    ZIP/folder upload will be handled as a separate artifact
                    scanning flow.
                  </p>
                  <Button
                    className="mt-5"
                    onClick={continueToManualRepository}
                  >
                    Add repository manually
                  </Button>
                </div>
              ) : null}

              {startMethod === 'services' ? (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-950">
                    Start with a service request
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    If this is for automation, DevOps, website development, or
                    engineering consulting, start from the services page and
                    connect GitHub later when a repository is ready.
                  </p>
                  <Button
                    className="mt-5"
                    onClick={continueToServices}
                  >
                    Explore services
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : (
            <Card>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Repositories are connected
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                We synced {syncedRepositoryCount} GitHub repositories. One last
                question helps us understand which channel is working.
              </p>
              <div className="mt-6 max-w-sm">
                <Select
                  id="discovery-source"
                  label="Where did you hear about Kodeye?"
                  onChange={(event) => setSource(event.target.value)}
                  value={source}
                >
                  <option value="">Select one</option>
                  {sourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                className="mt-6"
                disabled={!source}
                onClick={finishOnboarding}
              >
                <Rocket className="h-4 w-4" />
                Continue to dashboard
              </Button>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function StartMethodButton({
  active,
  description,
  icon: Icon,
  onClick,
  title,
}: {
  active: boolean;
  description: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      className={
        active
          ? 'rounded-2xl border border-brand-500 bg-brand-50 p-4 text-left ring-4 ring-brand-100'
          : 'rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-brand-200'
      }
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5 text-brand-600" />
      <p className="mt-4 font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  );
}

function Step({
  active,
  complete,
  description,
  title,
}: {
  active?: boolean;
  complete?: boolean;
  description: string;
  title: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={
          complete
            ? 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white'
            : active
              ? 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white'
              : 'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500'
        }
      >
        {complete ? <CheckCircle2 className="h-4 w-4" /> : null}
      </div>
      <div>
        <p className="font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
