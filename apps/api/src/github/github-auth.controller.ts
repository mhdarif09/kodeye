import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

import { GitHubOAuthService } from './github-oauth.service';
import { AppSettingsService } from '../settings/app-settings.service';

@ApiTags('Auth')
@Controller('auth')
export class GitHubAuthController {
  private readonly stateCookie = 'kodeye_github_oauth_state';

  constructor(
    private readonly configService: AppSettingsService,
    private readonly githubOAuthService: GitHubOAuthService,
  ) {}

  @Get('github')
  start(@Res() response: Response): void {
    const state = randomBytes(32).toString('hex');
    response.cookie(this.stateCookie, state, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: 'lax',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
    response.redirect(this.githubOAuthService.getAuthorizationUrl(state));
  }

  @Get('github/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (!code || !state || request.cookies?.[this.stateCookie] !== state) {
      throw new UnauthorizedException('Invalid GitHub OAuth state');
    }
    response.clearCookie(this.stateCookie);
    const result = await this.githubOAuthService.authenticate(code);
    const callbackUrl = new URL(
      this.configService.get<string>(
        'FRONTEND_AUTH_CALLBACK_URL',
        'http://localhost:3000/auth/callback',
      ),
    );
    // TODO: Replace URL token redirect with a one-time exchange or HttpOnly cookie.
    callbackUrl.searchParams.set('token', result.accessToken);
    response.redirect(callbackUrl.toString());
  }
}
