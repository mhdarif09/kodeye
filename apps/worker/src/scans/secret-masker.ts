export function maskSecret(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}********${value.slice(-4)}`;
}

export function safeCodeEvidence(value?: string): string | undefined {
  if (!value) return undefined;
  const truncated = value.slice(0, 4000);
  if (/(password|secret|token|api[_-]?key|private[_-]?key)/i.test(truncated)) {
    return '[potentially sensitive code evidence masked]';
  }
  return truncated;
}
