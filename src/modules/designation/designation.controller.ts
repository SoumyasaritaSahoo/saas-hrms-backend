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
import { DesignationService } from './designation.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { getAppRoute, successResponse } from '../../common/helpers/helper';
import { UserAuthGuard } from '../../guards/user-auth.guard';

@Controller()
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('designations'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const designations = await this.designationService.findAll(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
    );
    return successResponse({
      message: 'Designations fetched successfully',
      data: designations,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('designation_detail'))
  async findOne(@Req() req, @Param('id') id: string) {
    const designation = await this.designationService.findOne(id);
    return successResponse({
      message: 'Designation fetched successfully',
      data: designation,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_designations'))
  async getAllDesignations(@Req() req) {
    const designations = await this.designationService.getAllDesignations(
      req.headers['company-id'],
    );
    return successResponse({
      message: 'Designations fetched successfully',
      data: designations,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_designation'))
  async create(@Req() req, @Body() dto: CreateDesignationDto) {
    const designation = await this.designationService.create(
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Designation created successfully',
      data: designation,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_designation'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    const designation = await this.designationService.update(
      id,
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Designation updated successfully',
      data: designation,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_designation'))
  async remove(@Req() req, @Param('id') id: string) {
    await this.designationService.remove(
      id,
      req.headers['company-id'],
      req.user.id,
    );
    return successResponse({ message: 'Designation deleted successfully' });
  }
}
