import { Controller, Get, Param } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { IdParamDto } from '../events/dto/id-param.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venues: VenuesService) {}

  @Get(':id')
  @ApiOkResponse({ description: 'Venue detail' })
  async getById(@Param() { id }: IdParamDto) {
    return this.venues.byId(id);
  }
}
