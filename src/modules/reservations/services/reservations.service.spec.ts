import { HttpStatus } from '@nestjs/common';
import { AppHttpException } from '@common';
import type { Reservation, Room } from '../../../../generated/prisma/client';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { ReservationsRepository } from '../repositories';
import { ReservationsService } from './reservations.service';

jest.mock('@database', () => ({
  PrismaService: class PrismaService {},
}));

type ReservationsRepositoryMock = jest.Mocked<
  Pick<
    ReservationsRepository,
    | 'create'
    | 'delete'
    | 'findAll'
    | 'findConflictingReservation'
    | 'findReservationById'
    | 'findRoomById'
    | 'update'
  >
>;

const ROOM_ID = '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02';
const RESERVATION_ID = '5de98846-a9f6-4f73-8454-724407ab04c1';
const DATE = new Date('2026-06-20T13:00:00.000Z');

describe('ReservationsService', () => {
  let repository: ReservationsRepositoryMock;
  let service: ReservationsService;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findConflictingReservation: jest.fn(),
      findReservationById: jest.fn(),
      findRoomById: jest.fn(),
      update: jest.fn(),
    };
    service = new ReservationsService(
      repository as unknown as ReservationsRepository,
    );
  });

  it('blocks reservations for unknown rooms', async () => {
    repository.findRoomById.mockResolvedValue(null);

    await expectAppError(
      service.create(createReservationDto()),
      HttpStatus.NOT_FOUND,
      'A sala informada não existe.',
    );
  });

  it('blocks reservations that exceed room capacity', async () => {
    repository.findRoomById.mockResolvedValue(room({ capacity: 4 }));

    await expectAppError(
      service.create(createReservationDto({ participants: 5 })),
      HttpStatus.BAD_REQUEST,
      'A reserva excede a capacidade da sala.',
    );
  });

  it('blocks reservations where endsAt is not greater than startsAt', async () => {
    repository.findRoomById.mockResolvedValue(room());

    await expectAppError(
      service.create(
        createReservationDto({
          endsAt: '2026-06-20T14:00:00.000Z',
          startsAt: '2026-06-20T14:00:00.000Z',
        }),
      ),
      HttpStatus.BAD_REQUEST,
      'O horário final deve ser maior que o horário inicial.',
    );
  });

  it('blocks reservations that conflict with another reservation in the same room', async () => {
    repository.findRoomById.mockResolvedValue(room());
    repository.findConflictingReservation.mockResolvedValue(reservation());

    await expectAppError(
      service.create(createReservationDto()),
      HttpStatus.CONFLICT,
      'Já existe uma reserva para esta sala nesse horário.',
    );
  });

  it('ignores the current reservation when checking conflicts on update', async () => {
    repository.findReservationById.mockResolvedValue(reservation());
    repository.findRoomById.mockResolvedValue(room());
    repository.findConflictingReservation.mockResolvedValue(null);
    repository.update.mockResolvedValue(
      reservation({ title: 'Reuniao atualizada' }),
    );

    await service.update(RESERVATION_ID, {
      title: 'Reuniao atualizada',
    });

    expect(repository.findConflictingReservation).toHaveBeenCalledWith({
      endsAt: new Date('2026-06-20T15:00:00.000Z'),
      ignoredReservationId: RESERVATION_ID,
      roomId: ROOM_ID,
      startsAt: new Date('2026-06-20T14:00:00.000Z'),
    });
  });
});

async function expectAppError(
  promise: Promise<unknown>,
  statusCode: HttpStatus,
  message: string,
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected request to fail.');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(AppHttpException);
    expect((error as AppHttpException).getStatus()).toBe(statusCode);
    expect((error as AppHttpException).getResponse()).toMatchObject({
      message,
    });
  }
}

function createReservationDto(
  overrides: Partial<CreateReservationDto> = {},
): CreateReservationDto {
  return {
    endsAt: '2026-06-20T15:00:00.000Z',
    participants: 4,
    roomId: ROOM_ID,
    startsAt: '2026-06-20T14:00:00.000Z',
    title: 'Planejamento semanal',
    ...overrides,
  };
}

function room(overrides: Partial<Room> = {}): Room {
  return {
    capacity: 6,
    createdAt: DATE,
    id: ROOM_ID,
    name: 'Sala Reuniao 1',
    updatedAt: DATE,
    ...overrides,
  };
}

function reservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    createdAt: DATE,
    endsAt: new Date('2026-06-20T15:00:00.000Z'),
    id: RESERVATION_ID,
    participants: 4,
    roomId: ROOM_ID,
    startsAt: new Date('2026-06-20T14:00:00.000Z'),
    title: 'Planejamento semanal',
    updatedAt: DATE,
    ...overrides,
  };
}
