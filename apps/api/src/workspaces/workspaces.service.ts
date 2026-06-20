import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceSource } from '@prisma/client';
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto';
import type { CreateWorkspaceFileDto } from './dto/create-workspace-file.dto';
import type { RenameWorkspaceFileDto } from './dto/rename-workspace-file.dto';
import type { WriteWorkspaceFileDto } from './dto/write-workspace-file.dto';

const MAX_FILE_BYTES = 1024 * 1024;
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'target',
  'vendor',
]);

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    await this.organizations.findAccessibleById(userId, dto.organizationId);
    if (dto.repositoryId) {
      await this.assertRepositoryInOrganization(
        dto.organizationId,
        dto.repositoryId,
      );
    }
    const workspace = await this.prisma.workspace.create({
      data: {
        createdByUserId: userId,
        name: dto.name.trim(),
        organizationId: dto.organizationId,
        repositoryId: dto.repositoryId,
        rootPath: '',
        source: WorkspaceSource.LOCAL,
      },
    });
    const rootPath = safeStoragePath(workspace.id);
    await mkdir(rootPath, { recursive: true });
    return this.prisma.workspace.update({
      data: { rootPath },
      where: { id: workspace.id },
    });
  }

  findAll(userId: string) {
    return this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
  }

  async findOne(userId: string, workspaceId: string) {
    return this.findAccessibleWorkspace(userId, workspaceId);
  }

  async listFiles(userId: string, workspaceId: string, relativePath = '') {
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const directoryPath = safeWorkspacePath(workspace.rootPath, relativePath);
    await assertInsideRealWorkspace(workspace.rootPath, directoryPath);
    const directoryStat = await stat(directoryPath).catch(() => null);
    if (!directoryStat?.isDirectory()) {
      throw new NotFoundException('Workspace directory not found');
    }
    const entries = await readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.isSymbolicLink())
      .filter((entry) => !SKIPPED_DIRECTORIES.has(entry.name))
      .map((entry) => ({
        isDirectory: entry.isDirectory(),
        name: entry.name,
        path: toWorkspaceRelativePath(
          workspace.rootPath,
          path.join(directoryPath, entry.name),
        ),
      }))
      .sort((left, right) =>
        left.isDirectory === right.isDirectory
          ? left.name.localeCompare(right.name)
          : left.isDirectory
            ? -1
            : 1,
      );
  }

  async readFile(userId: string, workspaceId: string, relativePath: string) {
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const filePath = safeWorkspacePath(workspace.rootPath, relativePath);
    await assertInsideRealWorkspace(workspace.rootPath, filePath);
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat?.isFile()) throw new NotFoundException('File not found');
    if (fileStat.size > MAX_FILE_BYTES) {
      throw new BadRequestException('File is too large to open in the editor');
    }
    return {
      content: await readFile(filePath, 'utf8'),
      path: normalizeWorkspacePath(relativePath),
      size: fileStat.size,
      updatedAt: fileStat.mtime.toISOString(),
    };
  }

  async writeFile(
    userId: string,
    workspaceId: string,
    dto: WriteWorkspaceFileDto,
  ) {
    assertFileContentSize(dto.content);
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const filePath = safeWorkspacePath(workspace.rootPath, dto.path);
    await assertParentDirectory(workspace.rootPath, filePath);
    await assertWritableTargetPath(workspace.rootPath, filePath);
    await writeFile(filePath, dto.content, 'utf8');
    return this.readFile(userId, workspaceId, dto.path);
  }

  async createFile(
    userId: string,
    workspaceId: string,
    dto: CreateWorkspaceFileDto,
  ) {
    assertFileContentSize(dto.content ?? '');
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const filePath = safeWorkspacePath(workspace.rootPath, dto.path);
    if (await lstat(filePath).catch(() => null)) {
      throw new ConflictException('File already exists');
    }
    await assertParentDirectory(workspace.rootPath, filePath);
    await writeFile(filePath, dto.content ?? '', 'utf8');
    return this.readFile(userId, workspaceId, dto.path);
  }

  async deleteFile(userId: string, workspaceId: string, relativePath: string) {
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const filePath = safeWorkspacePath(workspace.rootPath, relativePath);
    await assertInsideRealWorkspace(workspace.rootPath, filePath);
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat?.isFile()) throw new NotFoundException('File not found');
    await rm(filePath, { force: true });
    return { deleted: true, path: normalizeWorkspacePath(relativePath) };
  }

  async renameFile(
    userId: string,
    workspaceId: string,
    dto: RenameWorkspaceFileDto,
  ) {
    const workspace = await this.findAccessibleWorkspace(userId, workspaceId);
    const fromPath = safeWorkspacePath(workspace.rootPath, dto.fromPath);
    const toPath = safeWorkspacePath(workspace.rootPath, dto.toPath);
    await assertInsideRealWorkspace(workspace.rootPath, fromPath);
    const fileStat = await stat(fromPath).catch(() => null);
    if (!fileStat?.isFile()) throw new NotFoundException('File not found');
    if (await lstat(toPath).catch(() => null)) {
      throw new ConflictException('Target exists');
    }
    await assertParentDirectory(workspace.rootPath, toPath);
    await rename(fromPath, toPath);
    return this.readFile(userId, workspaceId, dto.toPath);
  }

  private async assertRepositoryInOrganization(
    organizationId: string,
    repositoryId: string,
  ) {
    const repository = await this.prisma.repository.findFirst({
      select: { id: true },
      where: { id: repositoryId, organizationId },
    });
    if (!repository) throw new NotFoundException('Repository not found');
  }

  private async findAccessibleWorkspace(userId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (!workspace.rootPath) {
      throw new BadRequestException('Workspace storage is not initialized');
    }
    return workspace;
  }
}

function workspaceStorageRoot() {
  return path.resolve(process.env.WORKSPACE_STORAGE_DIR ?? './tmp/workspaces');
}

function safeStoragePath(workspaceId: string) {
  return safeWorkspacePath(workspaceStorageRoot(), workspaceId);
}

function safeWorkspacePath(rootPath: string, relativePath: string) {
  const root = path.resolve(rootPath);
  const normalized = normalizeWorkspacePath(relativePath);
  const resolved = path.resolve(root, normalized);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new BadRequestException('Path is outside the workspace root');
  }
  return resolved;
}

function normalizeWorkspacePath(value = '') {
  const normalized = value.replaceAll('\\', '/').replace(/^\/+/, '').trim();
  if (
    normalized.includes('\0') ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new BadRequestException('Invalid workspace path');
  }
  return normalized;
}

function toWorkspaceRelativePath(rootPath: string, absolutePath: string) {
  return path
    .relative(path.resolve(rootPath), absolutePath)
    .replaceAll('\\', '/');
}

async function assertParentDirectory(rootPath: string, filePath: string) {
  const parent = path.dirname(filePath);
  await assertInsideRealWorkspace(rootPath, parent);
  const parentStat = await stat(parent).catch(() => null);
  if (!parentStat?.isDirectory()) {
    throw new NotFoundException('Parent directory not found');
  }
}

function assertFileContentSize(content: string) {
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) {
    throw new BadRequestException('File is too large to save from the editor');
  }
}

async function assertInsideRealWorkspace(rootPath: string, targetPath: string) {
  const rootRealPath = await realpath(rootPath);
  const targetRealPath = await realpath(targetPath).catch(() => targetPath);
  const linkStat = await lstat(targetPath).catch(() => null);
  if (linkStat?.isSymbolicLink()) {
    throw new BadRequestException('Symbolic links are not supported');
  }
  if (
    targetRealPath !== rootRealPath &&
    !targetRealPath.startsWith(`${rootRealPath}${path.sep}`)
  ) {
    throw new BadRequestException('Path is outside the workspace root');
  }
}

async function assertWritableTargetPath(rootPath: string, targetPath: string) {
  const targetStat = await lstat(targetPath).catch(() => null);
  if (!targetStat) return;
  if (targetStat.isSymbolicLink()) {
    throw new BadRequestException('Symbolic links are not supported');
  }
  await assertInsideRealWorkspace(rootPath, targetPath);
}
