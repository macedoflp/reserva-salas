import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms';
import { ReservationsController } from './controllers';
import { ReservationsRepository } from './repositories';
import { ReservationsService } from './services';

@Module({
  imports: [RoomsModule],
  controllers: [ReservationsController],
  providers: [ReservationsRepository, ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
