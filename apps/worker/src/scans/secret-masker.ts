export function maskSecret(value: string): string {
  if (!value) return '';
  return '[REDACTED_SECRET]';
}

export function safeCodeEvidence(value?: string): string | undefined {
  if (!value) return undefined;
  const truncated = value.slice(0, 4000);
  if (/(password|secret|token|api[_-]?key|private[_-]?key)/i.test(truncated)) {
    return '[potentially sensitive code evidence masked]';
  }
  return truncated;
}
