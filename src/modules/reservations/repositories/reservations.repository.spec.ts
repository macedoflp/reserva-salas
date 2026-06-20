import { PrismaService } from '@database';
import { ReservationsRepository } from './reservations.repository';

jest.mock('@database', () => ({
  PrismaService: class PrismaService {},
}));

const ROOM_ID = '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02';
const RESERVATION_ID = '5de98846-a9f6-4f73-8454-724407ab04c1';

describe('ReservationsRepository', () => {
  it('uses strict overlap bounds when searching for conflicting reservations', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new ReservationsRepository({
      reservation: {
        findFirst,
      },
    } as unknown as PrismaService);
    const startsAt = new Date('2026-06-20T14:00:00.000Z');
    const endsAt = new Date('2026-06-20T15:00:00.000Z');

    await repository.findConflictingReservation({
      endsAt,
      ignoredReservationId: RESERVATION_ID,
      roomId: ROOM_ID,
      startsAt,
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        endsAt: {
          gt: startsAt,
        },
        id: {
          not: RESERVATION_ID,
        },
        roomId: ROOM_ID,
        startsAt: {
          lt: endsAt,
        },
      },
    });
  });
});
