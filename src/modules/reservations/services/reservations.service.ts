import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '@common';
import { RoomsService } from '../../rooms/services';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ListReservationsQueryDto } from '../dto/list-reservations-query.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationsRepository } from '../repositories';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly roomsService: RoomsService,
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
    await this.roomsService.findOne(createReservationDto.roomId);

    const startsAt = new Date(createReservationDto.startsAt);
    const endsAt = new Date(createReservationDto.endsAt);
    this.assertEndsAtAfterStartsAt(startsAt, endsAt);

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

    if (updateReservationDto.roomId) {
      await this.roomsService.findOne(updateReservationDto.roomId);
    }

    const startsAt = updateReservationDto.startsAt
      ? new Date(updateReservationDto.startsAt)
      : currentReservation.startsAt;
    const endsAt = updateReservationDto.endsAt
      ? new Date(updateReservationDto.endsAt)
      : currentReservation.endsAt;
    this.assertEndsAtAfterStartsAt(startsAt, endsAt);

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
    const reservation = await this.reservationsRepository.findById(id);

    if (!reservation) {
      this.throwReservationNotFound(id);
    }

    return reservation;
  }

  private assertEndsAtAfterStartsAt(startsAt: Date, endsAt: Date): void {
    if (endsAt <= startsAt) {
      throw new AppHttpException({
        error: 'Bad Request',
        message: 'endsAt must be greater than startsAt.',
        statusCode: HttpStatus.BAD_REQUEST,
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
