import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportHtmlService } from './report-html.service';
import { ReportJsonService } from './report-json.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportsService } from './reports.service';

@ApiBearerAuth()
@ApiTags('Reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scans/:id/report')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly htmlService: ReportHtmlService,
    private readonly jsonService: ReportJsonService,
    private readonly pdfService: ReportPdfService,
  ) {}

  @Get()
  data(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') scanId: string,
    @Query() _query: ReportQueryDto,
  ) {
    return this.reportsService.getReportData(user.id, scanId);
  }

  @Get('html')
  async html(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') scanId: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.reportsService.assertPdfAllowed(user.id, scanId);
    const report = await this.reportsService.getReportData(user.id, scanId);
    response.type('text/html').send(this.htmlService.render(report));
  }

  @Get('json')
  async json(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') scanId: string,
    @Res() response: Response,
  ): Promise<void> {
    const report = await this.reportsService.getReportData(user.id, scanId);
    response
      .type('application/json')
      .attachment(`kodeye-report-${scanId}.json`)
      .send(this.jsonService.render(report));
  }

  @Get('pdf')
  async pdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') scanId: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.reportsService.assertPdfAllowed(user.id, scanId);
    const report = await this.reportsService.getReportData(user.id, scanId);
    const pdf = await this.pdfService.render(this.htmlService.render(report));
    response
      .type('application/pdf')
      .attachment(`kodeye-report-${scanId}.pdf`)
      .send(pdf);
  }
}
