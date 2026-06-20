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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOkResponse({
    description: 'Rooms listed successfully.',
    isArray: true,
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
  @ApiOkResponse({
    description: 'Room found successfully.',
    type: RoomEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid room id.' })
  @ApiNotFoundResponse({ description: 'Room not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoomEntity> {
    return this.roomsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a room' })
  @ApiCreatedResponse({
    description: 'Room created successfully.',
    type: RoomEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid room payload.' })
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
  @ApiOkResponse({
    description: 'Room updated successfully.',
    type: RoomEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid room id or payload.' })
  @ApiNotFoundResponse({ description: 'Room not found.' })
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
  @ApiNoContentResponse({ description: 'Room deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid room id.' })
  @ApiNotFoundResponse({ description: 'Room not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.roomsService.remove(id);
  }
}
