import { Injectable } from '@nestjs/common';

import type { ReportData } from './types/report-data.type';

@Injectable()
export class ReportJsonService {
  render(report: ReportData): string {
    return JSON.stringify(report, null, 2);
  }
}
