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
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '@common';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import {
  ListReservationsQueryDto,
  ReservationOrder,
} from '../dto/list-reservations-query.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import {
  ReservationEntity,
  ReservationStatus,
} from '../entities/reservation.entity';
import { ReservationsService } from '../services';

@ApiTags('reservations')
@Controller({ path: 'reservations', version: '1' })
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'List reservations' })
  @ApiQuery({
    description: 'Filter reservations by room UUID.',
    example: '8a7f85d8-25c2-4d4e-9f33-e62dd16bda02',
    name: 'roomId',
    required: false,
  })
  @ApiQuery({
    description: 'Filter reservations by calculated status.',
    enum: ReservationStatus,
    name: 'status',
    required: false,
  })
  @ApiQuery({
    description: 'Sort reservations by start date.',
    enum: ReservationOrder,
    name: 'order',
    required: false,
  })
  @ApiResponse({
    description: 'Reservations listed successfully.',
    isArray: true,
    status: HttpStatus.OK,
    type: ReservationEntity,
  })
  @ApiResponse({
    description: 'Invalid query params.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  findAll(
    @Query() query: ListReservationsQueryDto,
  ): Promise<ReservationEntity[]> {
    return this.reservationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by id' })
  @ApiParam({
    description: 'Reservation UUID.',
    example: '5de98846-a9f6-4f73-8454-724407ab04c1',
    name: 'id',
  })
  @ApiResponse({
    description: 'Reservation found successfully.',
    status: HttpStatus.OK,
    type: ReservationEntity,
  })
  @ApiResponse({
    description: 'Invalid reservation id.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Reservation not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReservationEntity> {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reservation' })
  @ApiResponse({
    description: 'Reservation created successfully.',
    status: HttpStatus.CREATED,
    type: ReservationEntity,
  })
  @ApiResponse({
    description: 'Invalid payload, invalid time range, or room over capacity.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Room not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Reservation time conflict.',
    status: HttpStatus.CONFLICT,
    type: ApiErrorResponseDto,
  })
  create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<ReservationEntity> {
    return this.reservationsService.create(createReservationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reservation' })
  @ApiParam({
    description: 'Reservation UUID.',
    example: '5de98846-a9f6-4f73-8454-724407ab04c1',
    name: 'id',
  })
  @ApiResponse({
    description: 'Reservation updated successfully.',
    status: HttpStatus.OK,
    type: ReservationEntity,
  })
  @ApiResponse({
    description:
      'Invalid reservation id, invalid payload, invalid time range, or room over capacity.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Reservation or room not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Reservation time conflict.',
    status: HttpStatus.CONFLICT,
    type: ApiErrorResponseDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<ReservationEntity> {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reservation' })
  @ApiParam({
    description: 'Reservation UUID.',
    example: '5de98846-a9f6-4f73-8454-724407ab04c1',
    name: 'id',
  })
  @ApiResponse({
    description: 'Reservation deleted successfully.',
    status: HttpStatus.NO_CONTENT,
  })
  @ApiResponse({
    description: 'Invalid reservation id.',
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    description: 'Reservation not found.',
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponseDto,
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reservationsService.remove(id);
  }
}
