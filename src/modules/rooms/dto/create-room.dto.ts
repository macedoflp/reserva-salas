import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name.',
    example: 'Sala Reuniao 1',
    minLength: 1,
  })
  @IsString({ message: 'O nome da sala deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome da sala é obrigatório.' })
  name: string;

  @ApiProperty({
    description: 'Maximum number of participants supported by the room.',
    example: 8,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'A capacidade da sala é obrigatória.' })
  @IsInt({ message: 'A capacidade da sala deve ser um número inteiro.' })
  @Min(1, { message: 'A capacidade da sala deve ser maior que 0.' })
  capacity: number;
}
