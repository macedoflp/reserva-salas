import { ApiProperty } from '@nestjs/swagger';

export class RoomEntity {
  @ApiProperty({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
  })
  id: string;

  @ApiProperty({
    description: 'Room name.',
    example: 'Sala Reuniao 1',
  })
  name: string;

  @ApiProperty({
    description: 'Maximum number of participants supported by the room.',
    example: 8,
  })
  capacity: number;

  @ApiProperty({
    description: 'Date when the room was created.',
    example: '2026-06-20T13:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the room was last updated.',
    example: '2026-06-20T13:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: RoomEntity) {
    Object.assign(this, partial);
  }
}
