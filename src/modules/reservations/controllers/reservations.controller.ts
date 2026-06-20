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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOkResponse({
    description: 'Reservations listed successfully.',
    isArray: true,
    type: ReservationEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid query params.' })
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
  @ApiOkResponse({
    description: 'Reservation found successfully.',
    type: ReservationEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid reservation id.' })
  @ApiNotFoundResponse({ description: 'Reservation not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ReservationEntity> {
    return this.reservationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reservation' })
  @ApiCreatedResponse({
    description: 'Reservation created successfully.',
    type: ReservationEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid reservation payload.' })
  @ApiNotFoundResponse({ description: 'Room not found.' })
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
  @ApiOkResponse({
    description: 'Reservation updated successfully.',
    type: ReservationEntity,
  })
  @ApiBadRequestResponse({
    description: 'Invalid reservation id or payload.',
  })
  @ApiNotFoundResponse({ description: 'Reservation or room not found.' })
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
  @ApiNoContentResponse({ description: 'Reservation deleted successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid reservation id.' })
  @ApiNotFoundResponse({ description: 'Reservation not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.reservationsService.remove(id);
  }
}
