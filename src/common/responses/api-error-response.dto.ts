import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code.',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Clear error message.',
    example: 'Mensagem clara do erro',
  })
  message!: string;

  @ApiProperty({
    description: 'HTTP error reason.',
    example: 'Bad Request',
  })
  error!: string;

  @ApiProperty({
    description: 'ISO timestamp when the error happened.',
    example: '2026-01-01T00:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path that caused the error.',
    example: '/api/reservations',
  })
  path!: string;
}
