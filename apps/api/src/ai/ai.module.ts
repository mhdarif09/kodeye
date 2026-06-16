import { Module } from '@nestjs/common';

import { GitHubModule } from '../github/github.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GroqService } from './groq.service';

@Module({
  controllers: [AiController],
  imports: [GitHubModule],
  providers: [AiService, GroqService],
})
export class AiModule {}
