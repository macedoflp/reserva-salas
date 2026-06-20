import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name.',
    example: 'Sala Reuniao 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Maximum number of participants supported by the room.',
    example: 8,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  capacity: number;
}
