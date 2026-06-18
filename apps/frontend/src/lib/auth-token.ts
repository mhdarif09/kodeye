const ACCESS_TOKEN_KEY = 'kodeye_access_token';
const AUTH_SOURCE_KEY = 'kodeye_auth_source';
const ONBOARDING_COMPLETED_KEY = 'kodeye_onboarding_completed';
const ONBOARDING_SOURCE_KEY = 'kodeye_onboarding_source';

export type AuthSource = 'email' | 'github';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  // TODO: Prefer an HttpOnly cookie/session strategy for production.
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAuthSource(): AuthSource | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(AUTH_SOURCE_KEY);
  return value === 'email' || value === 'github' ? value : null;
}

export function setAuthSource(source: AuthSource): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_SOURCE_KEY, source);
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
}

export function completeOnboarding(source = 'Not specified'): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_SOURCE_KEY, source);
  window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_SOURCE_KEY);
}
