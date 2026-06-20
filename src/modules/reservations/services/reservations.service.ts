import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '@common';
import type { Room } from '../../../../generated/prisma/client';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ListReservationsQueryDto } from '../dto/list-reservations-query.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationsRepository } from '../repositories';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async findAll(query: ListReservationsQueryDto): Promise<ReservationEntity[]> {
    const reservations = await this.reservationsRepository.findAll(query);

    return reservations.map(
      (reservation) => new ReservationEntity(reservation),
    );
  }

  async findOne(id: string): Promise<ReservationEntity> {
    const reservation = await this.findByIdOrThrow(id);

    return new ReservationEntity(reservation);
  }

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationEntity> {
    const room = await this.findRoomByIdOrThrow(createReservationDto.roomId);

    const startsAt = new Date(createReservationDto.startsAt);
    const endsAt = new Date(createReservationDto.endsAt);
    this.assertEndsAtAfterStartsAt(startsAt, endsAt);
    this.assertParticipantsWithinCapacity(
      createReservationDto.participants,
      room,
    );
    await this.assertNoScheduleConflict({
      endsAt,
      roomId: createReservationDto.roomId,
      startsAt,
    });

    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      endsAt,
      startsAt,
    });

    return new ReservationEntity(reservation);
  }

  async update(
    id: string,
    updateReservationDto: UpdateReservationDto,
  ): Promise<ReservationEntity> {
    const currentReservation = await this.findByIdOrThrow(id);
    const roomId = updateReservationDto.roomId ?? currentReservation.roomId;
    const room = await this.findRoomByIdOrThrow(roomId);

    const participants =
      updateReservationDto.participants ?? currentReservation.participants;
    const startsAt = updateReservationDto.startsAt
      ? new Date(updateReservationDto.startsAt)
      : currentReservation.startsAt;
    const endsAt = updateReservationDto.endsAt
      ? new Date(updateReservationDto.endsAt)
      : currentReservation.endsAt;
    this.assertEndsAtAfterStartsAt(startsAt, endsAt);
    this.assertParticipantsWithinCapacity(participants, room);
    await this.assertNoScheduleConflict({
      endsAt,
      ignoredReservationId: id,
      roomId,
      startsAt,
    });

    const reservation = await this.reservationsRepository.update(id, {
      ...updateReservationDto,
      endsAt: updateReservationDto.endsAt ? endsAt : undefined,
      startsAt: updateReservationDto.startsAt ? startsAt : undefined,
    });

    return new ReservationEntity(reservation);
  }

  async remove(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.reservationsRepository.delete(id);
  }

  private async findByIdOrThrow(id: string) {
    const reservation =
      await this.reservationsRepository.findReservationById(id);

    if (!reservation) {
      this.throwReservationNotFound(id);
    }

    return reservation;
  }

  private async findRoomByIdOrThrow(id: string): Promise<Room> {
    const room = await this.reservationsRepository.findRoomById(id);

    if (!room) {
      throw new AppHttpException({
        error: 'Not Found',
        message: 'A sala informada não existe.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return room;
  }

  private assertEndsAtAfterStartsAt(startsAt: Date, endsAt: Date): void {
    if (endsAt <= startsAt) {
      throw new AppHttpException({
        error: 'Bad Request',
        message: 'O horário final deve ser maior que o horário inicial.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private assertParticipantsWithinCapacity(
    participants: number,
    room: Room,
  ): void {
    if (participants > room.capacity) {
      throw new AppHttpException({
        error: 'Bad Request',
        message: 'A reserva excede a capacidade da sala.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private async assertNoScheduleConflict(params: {
    endsAt: Date;
    ignoredReservationId?: string;
    roomId: string;
    startsAt: Date;
  }): Promise<void> {
    const conflictingReservation =
      await this.reservationsRepository.findConflictingReservation(params);

    if (conflictingReservation) {
      throw new AppHttpException({
        error: 'Conflict',
        message: 'Já existe uma reserva para esta sala nesse horário.',
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }

  private throwReservationNotFound(id: string): never {
    throw new AppHttpException({
      error: 'Not Found',
      message: `Reservation with id "${id}" was not found.`,
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}
