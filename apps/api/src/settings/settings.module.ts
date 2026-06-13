import { Global, Module } from '@nestjs/common';

import { AppSettingsService } from './app-settings.service';
import { SettingsController } from './settings.controller';

@Global()
@Module({
  controllers: [SettingsController],
  exports: [AppSettingsService],
  providers: [AppSettingsService],
})
export class SettingsModule {}
