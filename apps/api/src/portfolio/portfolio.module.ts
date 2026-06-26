import { Module } from '@nestjs/common';

import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  controllers: [PortfolioController],
  exports: [PortfolioService],
  providers: [PortfolioService],
})
export class PortfolioModule {}
