import { Module } from '@nestjs/common';

import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  controllers: [TeamController],
  exports: [TeamService],
  providers: [TeamService],
})
export class TeamModule {}
