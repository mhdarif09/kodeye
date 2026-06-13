import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { API_SERVICE_NAME, type HealthResponse } from '@kodeye/shared';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      service: API_SERVICE_NAME,
    };
  }
}
