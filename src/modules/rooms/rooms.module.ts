import { Module } from '@nestjs/common';
import { RoomsController } from './controllers';
import { RoomsRepository } from './repositories';
import { RoomsService } from './services';

@Module({
  controllers: [RoomsController],
  providers: [RoomsRepository, RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
