import { IsBoolean } from 'class-validator';

export class UpdateAutomationSettingsDto {
  @IsBoolean()
  autoScanPushEnabled!: boolean;

  @IsBoolean()
  autoScanPullRequestEnabled!: boolean;
}
