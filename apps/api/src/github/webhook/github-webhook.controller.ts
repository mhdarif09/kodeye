import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { GitHubWebhookSignatureService } from './github-webhook-signature.service';
import { GitHubWebhookService } from './github-webhook.service';
import type { GitHubWebhookPayload } from './types/github-webhook-payload.type';

@ApiTags('GitHub')
@Controller('github')
export class GitHubWebhookController {
  constructor(
    private readonly signature: GitHubWebhookSignatureService,
    private readonly webhook: GitHubWebhookService,
  ) {}

  @Post('webhook')
  receive(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature?: string,
    @Headers('x-github-event') eventName?: string,
    @Headers('x-github-delivery') deliveryId?: string,
    @Body() payload?: GitHubWebhookPayload,
  ) {
    if (!request.rawBody || !this.signature.isValid(request.rawBody, signature))
      throw new UnauthorizedException('Invalid GitHub webhook signature');
    if (!eventName || !deliveryId || !payload)
      throw new BadRequestException(
        'Missing GitHub webhook headers or payload',
      );
    return this.webhook.process(eventName, deliveryId, payload);
  }
}
