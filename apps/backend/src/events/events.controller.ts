import { Controller, Get, Param, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { GetEventsQueryDto } from './dto/get-events.query.dto';
import { IdParamDto } from './dto/id-param.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @ApiOkResponse({ description: 'List events with filters/pagination' })
  async list(@Query() q: GetEventsQueryDto) {
    return this.events.list(q);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Event detail' })
  async getById(@Param() { id }: IdParamDto) {
    return this.events.byId(id);
  }
}
