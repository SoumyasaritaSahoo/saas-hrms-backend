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
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { getAppRoute, successResponse } from '../../common/helpers/helper';
import { CreateLocationTypeDto } from './dto/create-location-type.dto';
import { UpdateLocationTypeDto } from './dto/update-location-type.dto';
import { LocationTypeService } from './location-type.service';

@Controller()
export class LocationTypeController {
  constructor(private readonly locationTypeService: LocationTypeService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('location_types'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.locationTypeService.findAll(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
    );
    return successResponse({
      message: 'Location types fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('location_type_detail'))
  async findOne(@Param('id') id: string) {
    const locationType = await this.locationTypeService.findOne(id);
    return successResponse({
      message: 'Location type fetched successfully',
      data: locationType,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_location_type'))
  async create(@Req() req, @Body() dto: CreateLocationTypeDto) {
    const locationType = await this.locationTypeService.create(
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Location type created successfully',
      data: locationType,
      statusCode: 201,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_location_type'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateLocationTypeDto,
  ) {
    const locationType = await this.locationTypeService.update(
      id,
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Location type updated successfully',
      data: locationType,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_location_type'))
  async remove(@Req() req, @Param('id') id: string) {
    await this.locationTypeService.remove(id, req.user.id);
    return successResponse({
      message: 'Location type deleted successfully',
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_location_types'))
  async getAllLocationTypes(@Req() req) {
    const locationTypes = await this.locationTypeService.getAllLocationTypes(
      req.headers['company-id'],
    );
    return successResponse({
      message: 'Location Types fetched successfully',
      data: locationTypes,
    });
  }
}
