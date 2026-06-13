import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class PaymentProvidersService {
  constructor(private readonly config: AppSettingsService) {}
  async midtrans(orderId: string, amount: number) {
    const key = this.config.get<string>('MIDTRANS_SERVER_KEY');
    if (!key)
      throw new ServiceUnavailableException('Midtrans is not configured');
    const production =
      this.config.get<string>('MIDTRANS_IS_PRODUCTION', 'false') === 'true';
    const response = await fetch(
      `${production ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com'}/snap/v1/transactions`,
      {
        body: JSON.stringify({
          transaction_details: { gross_amount: amount, order_id: orderId },
        }),
        headers: {
          Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
    if (!response.ok)
      throw new ServiceUnavailableException(
        'Midtrans checkout creation failed',
      );
    return response.json() as Promise<{ redirect_url: string; token: string }>;
  }
  verifyMidtrans(payload: Record<string, string>) {
    const key = this.config.get<string>('MIDTRANS_SERVER_KEY');
    if (!key)
      throw new ServiceUnavailableException('Midtrans is not configured');
    const expected = createHash('sha512')
      .update(
        `${payload.order_id}${payload.status_code}${payload.gross_amount}${key}`,
      )
      .digest('hex');
    if (payload.signature_key !== expected)
      throw new UnauthorizedException(
        'Invalid Midtrans notification signature',
      );
  }
  async paypal(path: string, method = 'GET', body?: object) {
    const id = this.config.get<string>('PAYPAL_CLIENT_ID');
    const secret = this.config.get<string>('PAYPAL_CLIENT_SECRET');
    if (!id || !secret)
      throw new ServiceUnavailableException('PayPal is not configured');
    const base =
      this.config.get<string>('PAYPAL_ENVIRONMENT', 'sandbox') === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    const auth = await fetch(`${base}/v1/oauth2/token`, {
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
    if (!auth.ok)
      throw new ServiceUnavailableException('PayPal authentication failed');
    const token = ((await auth.json()) as { access_token: string })
      .access_token;
    const response = await fetch(`${base}${path}`, {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method,
    });
    if (!response.ok) throw new BadRequestException('PayPal request failed');
    return response.status === 204 ? {} : response.json();
  }

  async verifyPayPalWebhook(
    headers: {
      authAlgo?: string;
      certUrl?: string;
      transmissionId?: string;
      transmissionSig?: string;
      transmissionTime?: string;
    },
    webhookEvent: object,
  ) {
    const webhookId = this.config.get<string>('PAYPAL_WEBHOOK_ID');
    if (
      !webhookId ||
      !headers.authAlgo ||
      !headers.certUrl ||
      !headers.transmissionId ||
      !headers.transmissionSig ||
      !headers.transmissionTime
    )
      throw new UnauthorizedException('Invalid PayPal webhook');
    const verification = (await this.paypal(
      '/v1/notifications/verify-webhook-signature',
      'POST',
      {
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_event: webhookEvent,
        webhook_id: webhookId,
      },
    )) as { verification_status?: string };
    if (verification.verification_status !== 'SUCCESS')
      throw new UnauthorizedException('Invalid PayPal webhook');
  }
}
