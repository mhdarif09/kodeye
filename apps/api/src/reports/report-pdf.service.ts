import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { AppSettingsService } from '../settings/app-settings.service';

@Injectable()
export class ReportPdfService {
  constructor(private readonly configService: AppSettingsService) {}

  async render(html: string): Promise<Buffer> {
    if (
      this.configService.get<string>('REPORT_ENABLE_PDF', 'true') !== 'true'
    ) {
      throw new ServiceUnavailableException('PDF generation is disabled');
    }
    const executablePath =
      this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH') ||
      findBrowserExecutable();
    if (!executablePath) {
      throw new ServiceUnavailableException(
        'PDF generation failed. Please ensure browser dependencies are installed.',
      );
    }

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath,
        headless: true,
      });
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const result = await page.pdf({
          displayHeaderFooter: true,
          footerTemplate:
            '<div style="font-size:8px;color:#64748b;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
          format: 'A4',
          headerTemplate: '<div></div>',
          margin: { bottom: '20mm', left: '15mm', right: '15mm', top: '18mm' },
          printBackground: true,
        });
        return Buffer.from(result);
      } finally {
        await browser.close();
      }
    } catch {
      throw new ServiceUnavailableException(
        'PDF generation failed. Please ensure browser dependencies are installed.',
      );
    }
  }
}

function findBrowserExecutable(): string | undefined {
  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    process.env.PROGRAMFILES
      ? path.join(
          process.env.PROGRAMFILES,
          'Google',
          'Chrome',
          'Application',
          'chrome.exe',
        )
      : '',
    process.env['PROGRAMFILES(X86)']
      ? path.join(
          process.env['PROGRAMFILES(X86)'],
          'Google',
          'Chrome',
          'Application',
          'chrome.exe',
        )
      : '',
    process.env.LOCALAPPDATA
      ? path.join(
          process.env.LOCALAPPDATA,
          'Google',
          'Chrome',
          'Application',
          'chrome.exe',
        )
      : '',
  ];
  return candidates.find((candidate) => candidate && existsSync(candidate));
}
