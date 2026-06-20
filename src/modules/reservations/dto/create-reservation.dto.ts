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
    return 'O horário final deve ser maior que o horário inicial.';
  }
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    format: 'uuid',
  })
  @IsUUID(undefined, { message: 'O id da sala deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O id da sala é obrigatório.' })
  roomId!: string;

  @ApiProperty({
    description: 'Reservation title.',
    example: 'Planejamento semanal',
    minLength: 1,
  })
  @IsString({ message: 'O título da reserva deve ser uma string.' })
  @IsNotEmpty({ message: 'O título da reserva é obrigatório.' })
  title!: string;

  @ApiProperty({
    description: 'Number of reservation participants.',
    example: 6,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'A quantidade de participantes é obrigatória.' })
  @IsInt({
    message: 'A quantidade de participantes deve ser um número inteiro.',
  })
  @Min(1, {
    message: 'A quantidade de participantes deve ser maior que 0.',
  })
  participants!: number;

  @ApiProperty({
    description: 'Reservation start date and time.',
    example: '2026-06-20T14:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString(undefined, {
    message: 'O horário inicial deve ser uma data válida.',
  })
  @IsNotEmpty({ message: 'O horário inicial é obrigatório.' })
  startsAt!: string;

  @ApiProperty({
    description: 'Reservation end date and time.',
    example: '2026-06-20T15:00:00.000Z',
    format: 'date-time',
  })
  @IsDateString(undefined, {
    message: 'O horário final deve ser uma data válida.',
  })
  @IsNotEmpty({ message: 'O horário final é obrigatório.' })
  @Validate(EndsAtAfterStartsAtConstraint)
  endsAt!: string;
}
