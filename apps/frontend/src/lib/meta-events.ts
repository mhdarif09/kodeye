'use client';

export type MetaEventName =
  | 'CompleteRegistration'
  | 'Contact'
  | 'Search'
  | 'ViewContent';

export interface MetaUserData {
  city?: string;
  country?: string;
  dateOfBirth?: string;
  email?: string;
  externalId?: string;
  firstName?: string;
  gender?: string;
  lastName?: string;
  phone?: string;
  state?: string;
  subscriptionId?: string;
  zip?: string;
}

interface TrackMetaEventOptions {
  customData?: Record<string, string | number | boolean | null | undefined>;
  eventId?: string;
  userData?: MetaUserData;
}

declare global {
  interface Window {
    fbq?: (
      command: 'track',
      eventName: MetaEventName,
      parameters?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
  }
}

export function createMetaEventId(eventName: MetaEventName) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `kodeye-${eventName}-${suffix}`;
}

export function trackMetaEvent(
  eventName: MetaEventName,
  options: TrackMetaEventOptions = {},
) {
  if (typeof window === 'undefined') return;

  const eventId = options.eventId ?? createMetaEventId(eventName);
  const customData = stripEmptyValues(options.customData ?? {});

  window.fbq?.('track', eventName, customData, { eventID: eventId });

  void fetch('/api/meta/conversions', {
    body: JSON.stringify({
      customData,
      eventId,
      eventName,
      sourceUrl: window.location.href,
      userData: stripEmptyValues({ ...(options.userData ?? {}) }),
    }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => {
    // Analytics must never interrupt the user's flow.
  });
}

function stripEmptyValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false;
      if (typeof entry === 'string') return entry.trim().length > 0;
      return true;
    }),
  );
}
