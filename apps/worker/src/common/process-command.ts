import { spawn } from 'node:child_process';

const MAX_CAPTURE_BYTES = 64 * 1024;

export interface CommandResult {
  error?: string;
  exitCode: number;
  stderr: string;
  stdout: string;
  timedOut: boolean;
}

function appendLimited(current: string, chunk: Buffer): string {
  if (current.length >= MAX_CAPTURE_BYTES) return current;
  return (current + chunk.toString()).slice(0, MAX_CAPTURE_BYTES);
}

export function processCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    let settled = false;
    let stderr = '';
    let stdout = '';
    const finish = (result: CommandResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
    });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish({
        error: `${command} timed out after ${timeoutMs}ms`,
        exitCode: 124,
        stderr,
        stdout,
        timedOut: true,
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout = appendLimited(stdout, chunk);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = appendLimited(stderr, chunk);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      finish({
        error: `${command} could not be started: ${error.message}`,
        exitCode: 127,
        stderr,
        stdout,
        timedOut: false,
      });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      finish({
        exitCode: exitCode ?? 1,
        stderr,
        stdout,
        timedOut: false,
      });
    });
  });
}
