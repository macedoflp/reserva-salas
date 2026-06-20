import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthCheckResponse } from './app.service';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Healthcheck da API' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth(): HealthCheckResponse {
    return this.appService.getHealth();
  }
}
