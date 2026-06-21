export const siteUrl = normalizedSiteUrl();

export const siteName = 'Kodeye';

export const defaultSeoDescription =
  'Kodeye is an AI-powered secure code review and engineering automation platform for code audits, scanner findings, AI fixes, DevOps, and digital operations.';

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

function normalizedSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_LANDING_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';
  return value.endsWith('/') ? value : `${value}/`;
}
