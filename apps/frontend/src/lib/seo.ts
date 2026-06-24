export const siteUrl = normalizedSiteUrl();

export const siteName = 'Kodeye';

export const defaultSeoDescription =
  'Kodeye membantu bisnis membangun sistem digital modern melalui AI automation, web development, DevOps, infrastructure, code audit, dan produk SaaS.';

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString();
}

function normalizedSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_LANDING_URL ||
    process.env.APP_URL ||
    'https://kodeye.net';
  return value.endsWith('/') ? value : `${value}/`;
}
