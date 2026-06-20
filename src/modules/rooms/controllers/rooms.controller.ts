import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('rooms')
@Controller({ path: 'rooms', version: '1' })
export class RoomsController {}
