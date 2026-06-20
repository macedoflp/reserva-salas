import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthCheckResponse } from './app.service';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Healthcheck da API' })
  @ApiResponse({
    description: 'API is running.',
    status: HttpStatus.OK,
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
