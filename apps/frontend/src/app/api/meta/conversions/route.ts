import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const pixelId = process.env.META_PIXEL_ID ?? '1775848800523906';
const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
const testEventCode = process.env.META_TEST_EVENT_CODE;
const graphApiVersion = process.env.META_GRAPH_API_VERSION ?? 'v23.0';

const allowedEventNames = new Set([
  'CompleteRegistration',
  'Contact',
  'Search',
  'ViewContent',
]);

type MetaEventName =
  | 'CompleteRegistration'
  | 'Contact'
  | 'Search'
  | 'ViewContent';

interface MetaEventPayload {
  customData?: Record<string, unknown>;
  eventId?: string;
  eventName?: MetaEventName;
  sourceUrl?: string;
  userData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  if (!accessToken) {
    return NextResponse.json({ skipped: true, success: true });
  }

  let body: MetaEventPayload;
  try {
    body = (await request.json()) as MetaEventPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload', success: false },
      { status: 400 },
    );
  }

  if (!body.eventName || !allowedEventNames.has(body.eventName)) {
    return NextResponse.json(
      { error: 'Unsupported Meta event', success: false },
      { status: 400 },
    );
  }

  const sourceUrl =
    safeString(body.sourceUrl) ?? request.headers.get('referer') ?? undefined;
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const clientIp = getClientIp(request);
  const eventId =
    safeString(body.eventId) ??
    `kodeye-server-${body.eventName}-${Date.now().toString(36)}`;

  const event: Record<string, unknown> = {
    action_source: 'website',
    event_id: eventId,
    event_name: body.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: sourceUrl,
    user_data: buildUserData(body.userData ?? {}, userAgent, clientIp),
  };

  if (body.eventName === 'CompleteRegistration') {
    event.data_processing_options = [];
    event.data_processing_options_country = 0;
    event.data_processing_options_state = 0;
  }

  const customData = stripEmptyValues(body.customData ?? {});
  if (Object.keys(customData).length > 0) {
    event.custom_data = customData;
  }

  const graphUrl = new URL(
    `https://graph.facebook.com/${graphApiVersion}/${pixelId}/events`,
  );
  graphUrl.searchParams.set('access_token', accessToken);

  const payload: Record<string, unknown> = { data: [stripEmptyValues(event)] };
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const response = await fetch(graphUrl, {
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    const result = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Meta Conversions API rejected the event', result },
        { status: 502 },
      );
    }

    return NextResponse.json({ result, success: true });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach Meta Conversions API', success: false },
      { status: 502 },
    );
  }
}

function buildUserData(
  rawUserData: Record<string, unknown>,
  userAgent?: string,
  clientIp?: string,
) {
  return stripEmptyValues({
    client_ip_address: clientIp,
    client_user_agent: userAgent,
    country: hashField(rawUserData.country),
    ct: hashField(rawUserData.city),
    db: hashField(rawUserData.dateOfBirth),
    em: hashArrayField(rawUserData.email),
    external_id: hashArrayField(rawUserData.externalId),
    fn: hashField(rawUserData.firstName),
    ge: hashField(rawUserData.gender),
    ln: hashField(rawUserData.lastName),
    ph: hashArrayField(rawUserData.phone),
    st: hashField(rawUserData.state),
    subscription_id: safeString(rawUserData.subscriptionId),
    zp: hashField(rawUserData.zip),
  });
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

function hashArrayField(value: unknown) {
  const normalized = normalize(value);
  return normalized ? [sha256(normalized)] : undefined;
}

function hashField(value: unknown) {
  const normalized = normalize(value);
  return normalized ? sha256(normalized) : undefined;
}

function normalize(value: unknown) {
  const stringValue = safeString(value);
  if (!stringValue) return undefined;

  return stringValue.trim().toLowerCase().replace(/\s+/g, '');
}

function safeString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function stripEmptyValues(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null) return false;
      if (Array.isArray(entry)) return entry.length > 0;
      if (typeof entry === 'object') return Object.keys(entry).length > 0;
      if (typeof entry === 'string') return entry.trim().length > 0;
      return true;
    }),
  );
}
