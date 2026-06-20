import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'endsAtAfterStartsAt', async: false })
class EndsAtAfterStartsAtConstraint implements ValidatorConstraintInterface {
  validate(endsAt: string, args: ValidationArguments): boolean {
    const reservation = args.object as { startsAt?: string };

    if (!endsAt || !reservation.startsAt) {
      return true;
    }

    const startsAtDate = new Date(reservation.startsAt);
    const endsAtDate = new Date(endsAt);

    if (
      Number.isNaN(startsAtDate.getTime()) ||
      Number.isNaN(endsAtDate.getTime())
    ) {
      return true;
    }

    return endsAtDate > startsAtDate;
  }

  defaultMessage(): string {
    return 'endsAt must be greater than startsAt.';
  }
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
  })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Reservation title.',
    example: 'Planejamento semanal',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Number of reservation participants.',
    example: 6,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  participants: number;

  @ApiProperty({
    description: 'Reservation start date and time.',
    example: '2026-06-20T14:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiProperty({
    description: 'Reservation end date and time.',
    example: '2026-06-20T15:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  @Validate(EndsAtAfterStartsAtConstraint)
  endsAt: string;
}
