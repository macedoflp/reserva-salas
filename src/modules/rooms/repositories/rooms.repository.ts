import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database';
import type { Room } from '../../../../generated/prisma/client';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Room[]> {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: {
        id,
      },
    });
  }

  create(createRoomDto: CreateRoomDto): Promise<Room> {
    return this.prisma.room.create({
      data: createRoomDto,
    });
  }

  update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    return this.prisma.room.update({
      data: updateRoomDto,
      where: {
        id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.room.delete({
      where: {
        id,
      },
    });
  }
}
