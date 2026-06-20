import { ApiProperty } from '@nestjs/swagger';
import type { Reservation } from '../../../../generated/prisma/client';

export enum ReservationStatus {
  Finished = 'finished',
  Ongoing = 'ongoing',
  Upcoming = 'upcoming',
}

export class ReservationEntity {
  @ApiProperty({
    description: 'Reservation UUID.',
    example: '5de98846-a9f6-4f73-8454-724407ab04c1',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    format: 'uuid',
  })
  roomId!: string;

  @ApiProperty({
    description: 'Reservation title.',
    example: 'Planejamento semanal',
  })
  title!: string;

  @ApiProperty({
    description: 'Number of reservation participants.',
    example: 6,
  })
  participants!: number;

  @ApiProperty({
    description: 'Reservation start date and time.',
    example: '2026-06-20T14:00:00.000Z',
    format: 'date-time',
  })
  startsAt!: Date;

  @ApiProperty({
    description: 'Reservation end date and time.',
    example: '2026-06-20T15:00:00.000Z',
    format: 'date-time',
  })
  endsAt!: Date;

  @ApiProperty({
    description: 'Calculated reservation status.',
    enum: ReservationStatus,
    example: ReservationStatus.Upcoming,
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Date when the reservation was created.',
    example: '2026-06-20T13:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the reservation was last updated.',
    example: '2026-06-20T13:00:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;

  constructor(reservation: Reservation) {
    Object.assign(this, reservation);
    this.status = ReservationEntity.calculateStatus(reservation);
  }

  private static calculateStatus(
    reservation: Pick<Reservation, 'endsAt' | 'startsAt'>,
  ): ReservationStatus {
    const now = new Date();

    if (reservation.endsAt <= now) {
      return ReservationStatus.Finished;
    }

    if (reservation.startsAt <= now && reservation.endsAt > now) {
      return ReservationStatus.Ongoing;
    }

    return ReservationStatus.Upcoming;
  }
}
