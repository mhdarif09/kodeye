import { Injectable } from '@nestjs/common';

import { ReportRendererService } from './report-renderer.service';
import type { ReportData } from './types/report-data.type';

@Injectable()
export class ReportHtmlService {
  constructor(private readonly renderer: ReportRendererService) {}

  render(report: ReportData): string {
    return this.renderer.render(report);
  }
}
