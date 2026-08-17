import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { getAppRoute, successResponse } from 'src/common/helpers/helper';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('locations'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('location_type_id') locationTypeId?: string,
  ) {
    const result = await this.locationService.findAll(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
      locationTypeId || undefined,
    );
    return successResponse({
      message: 'Locations fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('location_detail'))
  async findOne(@Param('id') id: string) {
    const location = await this.locationService.findOne(id);
    return successResponse({
      message: 'Location fetched successfully',
      data: location,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_location'))
  async create(@Req() req, @Body() dto: CreateLocationDto) {
    const location = await this.locationService.create(
      req.headers['company-id'],
      dto.location_type_id,
      dto,
      req.user.id,
    );
    return successResponse({
      message: 'Location created successfully',
      data: location,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_location'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const location = await this.locationService.update(
      id,
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Location updated successfully',
      data: location,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_location'))
  async remove(@Req() req, @Param('id') id: string) {
    await this.locationService.remove(
      id,
      req.headers['company-id'],
      req.user.id,
    );
    return successResponse({
      message: 'Location deleted successfully',
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_locations'))
  async getAllLocations(@Req() req) {
    const locations = await this.locationService.getAllLocations(
      req.headers['company-id'],
    );
    return successResponse({
      message: 'Locations fetched successfully',
      data: locations,
    });
  }
}
