import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reservations')
@Controller({ path: 'reservations', version: '1' })
export class ReservationsController {}
