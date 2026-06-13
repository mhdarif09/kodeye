const SENSITIVE_KEY =
  /(authorization|cookie|database.?url|encryption.?key|jwt|password|private.?key|refresh.?token|secret|server.?key|snap.?token|token|webhook.?secret)/i;

export function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[TRUNCATED]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value))
    return value.slice(0, 50).map((item) => redactSensitive(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactSensitive(item, depth + 1),
    ]),
  );
}

export function redactString(value: string): string {
  return value
    .replace(/(bearer\s+)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/([?&](?:token|secret|key|password)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/[^:/\s]+:)[^@\s]+(@)/gi, '$1[REDACTED]$2')
    .slice(0, 2000);
}
