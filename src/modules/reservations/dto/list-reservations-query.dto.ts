import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export enum ReservationOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export class ListReservationsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter reservations by room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: 'O filtro roomId deve ser um UUID válido.' })
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({
    description: 'Filter reservations by calculated status.',
    enum: ReservationStatus,
  })
  @IsEnum(ReservationStatus, {
    message: 'O status deve ser upcoming, ongoing ou finished.',
  })
  @IsOptional()
  status?: ReservationStatus;

  @ApiPropertyOptional({
    default: ReservationOrder.Desc,
    description: 'Sort reservations by start date.',
    enum: ReservationOrder,
  })
  @IsEnum(ReservationOrder, {
    message: 'A ordenação deve ser asc ou desc.',
  })
  @IsOptional()
  order?: ReservationOrder = ReservationOrder.Desc;
}
