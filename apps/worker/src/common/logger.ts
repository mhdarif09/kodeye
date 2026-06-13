function safeError(error: unknown): string {
  return redact(error instanceof Error ? error.message : 'Unknown error');
}

function redact(value: string): string {
  return value
    .replace(/(bearer\s+)[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/([?&](?:token|secret|key|password)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/(https?:\/\/[^:/\s]+:)[^@\s]+(@)/gi, '$1[REDACTED]$2')
    .slice(0, 1000);
}

export const logger = {
  error(message: string, error?: unknown) {
    console.error(`[error] ${message}${error ? `: ${safeError(error)}` : ''}`);
  },
  info(message: string) {
    console.log(`[info] ${message}`);
  },
  warn(message: string) {
    console.warn(`[warn] ${message}`);
  },
};
