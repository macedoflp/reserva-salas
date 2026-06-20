import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database';
import type { Prisma, Reservation } from '../../../../generated/prisma/client';
import {
  ListReservationsQueryDto,
  ReservationOrder,
} from '../dto/list-reservations-query.dto';
import { ReservationStatus } from '../entities/reservation.entity';

interface CreateReservationData {
  endsAt: Date;
  participants: number;
  roomId: string;
  startsAt: Date;
  title: string;
}

interface UpdateReservationData {
  endsAt?: Date;
  participants?: number;
  roomId?: string;
  startsAt?: Date;
  title?: string;
}

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListReservationsQueryDto): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      orderBy: {
        startsAt: query.order ?? ReservationOrder.Desc,
      },
      where: this.buildWhere(query),
    });
  }

  findById(id: string): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: {
        id,
      },
    });
  }

  create(data: CreateReservationData): Promise<Reservation> {
    return this.prisma.reservation.create({
      data,
    });
  }

  update(id: string, data: UpdateReservationData): Promise<Reservation> {
    return this.prisma.reservation.update({
      data,
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reservation.delete({
      where: {
        id,
      },
    });
  }

  private buildWhere(
    query: ListReservationsQueryDto,
  ): Prisma.ReservationWhereInput {
    const now = new Date();
    const where: Prisma.ReservationWhereInput = {};

    if (query.roomId) {
      where.roomId = query.roomId;
    }

    if (query.status === ReservationStatus.Ongoing) {
      where.startsAt = {
        lte: now,
      };
      where.endsAt = {
        gt: now,
      };
    }

    if (query.status === ReservationStatus.Upcoming) {
      where.startsAt = {
        gt: now,
      };
    }

    if (query.status === ReservationStatus.Finished) {
      where.endsAt = {
        lte: now,
      };
    }

    return where;
  }
}
