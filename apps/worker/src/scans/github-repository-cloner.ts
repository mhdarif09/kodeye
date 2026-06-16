import path from 'node:path';

import { prepareDirectory, safeChildPath } from '../common/filesystem';
import { processCommand } from '../common/process-command';

export async function cloneGitHubRepository(input: {
  branch: string;
  fullName: string;
  installationToken: string;
  jobId: string;
  tempDir: string;
  timeoutMs: number;
}): Promise<string> {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.fullName)) {
    throw new Error('GitHub repository full name is invalid');
  }
  assertValidBranch(input.branch);
  const repositoryPath = safeChildPath(input.tempDir, input.jobId);
  await prepareDirectory(repositoryPath);

  const authenticatedUrl = new URL(`https://github.com/${input.fullName}.git`);
  authenticatedUrl.username = 'x-access-token';
  authenticatedUrl.password = input.installationToken;
  const result = await processCommand(
    'git',
    [
      '-c',
      'http.sslVerify=true',
      '-c',
      'protocol.version=2',
      'clone',
      '--depth',
      '1',
      '--branch',
      input.branch,
      authenticatedUrl.toString(),
      repositoryPath,
    ],
    path.dirname(repositoryPath),
    input.timeoutMs,
  );
  if (result.exitCode !== 0) throw new Error('Repository clone failed');

  const removeRemote = await processCommand(
    'git',
    ['remote', 'remove', 'origin'],
    repositoryPath,
    input.timeoutMs,
  );
  if (removeRemote.exitCode !== 0) {
    throw new Error('Repository clone credentials could not be removed');
  }
  return repositoryPath;
}

export async function clonePublicGitHubRepository(input: {
  branch: string;
  jobId: string;
  repoUrl: string;
  tempDir: string;
  timeoutMs: number;
}): Promise<string> {
  assertValidBranch(input.branch);
  const repositoryUrl = new URL(input.repoUrl);
  if (
    repositoryUrl.protocol !== 'https:' ||
    repositoryUrl.hostname.toLowerCase() !== 'github.com' ||
    repositoryUrl.username ||
    repositoryUrl.password ||
    !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(
      repositoryUrl.pathname,
    )
  ) {
    throw new Error('Manual scan requires a public GitHub repository URL');
  }

  const repositoryPath = safeChildPath(input.tempDir, input.jobId);
  await prepareDirectory(repositoryPath);
  const result = await processCommand(
    'git',
    [
      '-c',
      'http.sslVerify=true',
      '-c',
      'protocol.version=2',
      'clone',
      '--depth',
      '1',
      '--branch',
      input.branch,
      repositoryUrl.toString(),
      repositoryPath,
    ],
    path.dirname(repositoryPath),
    input.timeoutMs,
  );
  if (result.exitCode !== 0) {
    throw new Error(
      'Public repository clone failed. Confirm the URL, branch, and repository visibility.',
    );
  }
  return repositoryPath;
}

function assertValidBranch(branch: string) {
  if (
    branch.length > 255 ||
    branch.startsWith('-') ||
    branch.includes('..') ||
    !/^[A-Za-z0-9._/-]+$/.test(branch)
  ) {
    throw new Error('Git branch is invalid');
  }
}
