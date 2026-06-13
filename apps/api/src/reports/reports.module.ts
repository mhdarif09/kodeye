import { Module } from '@nestjs/common';

import { ReportHtmlService } from './report-html.service';
import { ReportJsonService } from './report-json.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportRendererService } from './report-renderer.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  exports: [ReportPdfService],
  providers: [
    ReportsService,
    ReportRendererService,
    ReportHtmlService,
    ReportJsonService,
    ReportPdfService,
  ],
})
export class ReportsModule {}
