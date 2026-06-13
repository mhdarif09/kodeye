import 'dotenv/config';

import { WORKER_SERVICE_NAME } from '@kodeye/shared';

import { loadWorkerEnvironment } from './config/env';
import { applyDashboardSettings } from './config/dashboard-settings';
import { prisma } from './database/prisma';
import { logger } from './common/logger';
import { ScanWorker } from './scans/scan-worker';

async function main() {
  const environment = await applyDashboardSettings(
    prisma,
    loadWorkerEnvironment(),
  );
  if (!environment.scanWorkerEnabled) {
    logger.info(`${WORKER_SERVICE_NAME} is running, scan execution disabled`);
    return;
  }

  const worker = new ScanWorker(prisma, environment);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  }
  await worker.start();
}

void main().catch(async (error: unknown) => {
  logger.error('kodeye-worker failed to start', error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
