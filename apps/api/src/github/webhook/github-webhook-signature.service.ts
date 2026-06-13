import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class GitHubWebhookSignatureService {
  constructor(private readonly config: AppSettingsService) {}

  isValid(rawBody: Buffer, signature?: string): boolean {
    const secret = this.config.get<string>('GITHUB_APP_WEBHOOK_SECRET');
    if (!secret || !signature?.startsWith('sha256=')) return false;
    const expected = `sha256=${createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')}`;
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  }
}
