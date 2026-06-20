import { HttpStatus, Injectable } from '@nestjs/common';
import { AppHttpException } from '@common';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomEntity } from '../entities/room.entity';
import { RoomsRepository } from '../repositories';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async findAll(): Promise<RoomEntity[]> {
    const rooms = await this.roomsRepository.findAll();

    return rooms.map((room) => new RoomEntity(room));
  }

  async findOne(id: string): Promise<RoomEntity> {
    const room = await this.roomsRepository.findById(id);

    if (!room) {
      this.throwRoomNotFound(id);
    }

    return new RoomEntity(room);
  }

  async create(createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    const room = await this.roomsRepository.create(createRoomDto);

    return new RoomEntity(room);
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<RoomEntity> {
    await this.findOne(id);

    const room = await this.roomsRepository.update(id, updateRoomDto);

    return new RoomEntity(room);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roomsRepository.delete(id);
  }

  private throwRoomNotFound(id: string): never {
    throw new AppHttpException({
      error: 'Not Found',
      message: `Room with id "${id}" was not found.`,
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}
