import { Module } from '@nestjs/common';
import { ReservationsController } from './controllers';
import { ReservationsRepository } from './repositories';
import { ReservationsService } from './services';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsRepository, ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
