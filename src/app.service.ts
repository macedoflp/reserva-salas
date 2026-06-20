import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: 'ok';
}

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return { status: 'ok' };
  }
}
