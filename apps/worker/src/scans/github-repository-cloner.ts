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
  if (
    input.branch.length > 255 ||
    input.branch.startsWith('-') ||
    input.branch.includes('..') ||
    !/^[A-Za-z0-9._/-]+$/.test(input.branch)
  ) {
    throw new Error('Git branch is invalid');
  }
  const repositoryPath = safeChildPath(input.tempDir, input.jobId);
  await prepareDirectory(repositoryPath);

  const authenticatedUrl = new URL(`https://github.com/${input.fullName}.git`);
  authenticatedUrl.username = 'x-access-token';
  authenticatedUrl.password = input.installationToken;
  const result = await processCommand(
    'git',
    [
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
