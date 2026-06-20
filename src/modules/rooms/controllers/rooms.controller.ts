import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@common';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { RoomEntity } from '../entities/room.entity';
import { RoomsService } from '../services';

@ApiTags('rooms')
@Controller({ path: 'rooms', version: '1' })
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms' })
  @ApiResponse({
    description: 'Rooms listed successfully.',
    isArray: true,
    status: HttpStatus.OK,
    type: RoomEntity,
  })
  findAll(): Promise<RoomEntity[]> {
    return this.roomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by id' })
  @ApiParam({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    name: 'id',
  })
  @ApiResponse({
    description: 'Room found successfully.',
    status: HttpStatus.OK,
    type: RoomEntity,
  })
  @ApiResponse({
    description: 'Invalid room id.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Room not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoomEntity> {
    return this.roomsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a room' })
  @ApiResponse({
    description: 'Room created successfully.',
    status: HttpStatus.CREATED,
    type: RoomEntity,
  })
  @ApiResponse({
    description: 'Invalid room payload.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  create(@Body() createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    return this.roomsService.create(createRoomDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiParam({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    name: 'id',
  })
  @ApiResponse({
    description: 'Room updated successfully.',
    status: HttpStatus.OK,
    type: RoomEntity,
  })
  @ApiResponse({
    description: 'Invalid room id or payload.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Room not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<RoomEntity> {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiParam({
    description: 'Room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    name: 'id',
  })
  @ApiResponse({
    description: 'Room deleted successfully.',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    description: 'Invalid room id.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Room not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.roomsService.remove(id);
  }
}
