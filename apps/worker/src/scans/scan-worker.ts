import { ScanStatus, type PrismaClient } from '@prisma/client';

import { logger } from '../common/logger';
import type { WorkerEnvironment } from '../config/env';
import { ScanProcessor } from './scan-processor';

export class ScanWorker {
  private readonly processor: ScanProcessor;
  private processing = false;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly environment: WorkerEnvironment,
  ) {
    this.processor = new ScanProcessor(prisma, environment);
  }

  async start() {
    logger.info('kodeye-worker is running, scan execution enabled');
    logger.info(
      `kodeye-worker is polling every ${this.environment.pollIntervalMs}ms with concurrency ${this.environment.maxConcurrency}`,
    );
    await this.poll();
    setInterval(() => void this.poll(), this.environment.pollIntervalMs);
  }

  private async poll() {
    if (this.processing) return;
    this.processing = true;
    try {
      const pending = await this.prisma.scanJob.findFirst({
        orderBy: { createdAt: 'asc' },
        where: { status: ScanStatus.PENDING },
      });
      if (!pending) return;

      const claimed = await this.prisma.scanJob.updateMany({
        data: { startedAt: new Date(), status: ScanStatus.RUNNING },
        where: { id: pending.id, status: ScanStatus.PENDING },
      });
      if (claimed.count === 0) return;

      await this.prisma.scanLog.create({
        data: {
          level: 'info',
          message: 'picked scan job',
          scanJobId: pending.id,
        },
      });
      await this.processor.process({
        ...pending,
        startedAt: new Date(),
        status: ScanStatus.RUNNING,
      });
    } catch (error) {
      logger.error('scan poll failed', error);
    } finally {
      this.processing = false;
    }
  }
}
