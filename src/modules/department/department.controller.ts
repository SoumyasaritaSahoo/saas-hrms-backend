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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { getAppRoute, successResponse } from '../../common/helpers/helper';
import { UserAuthGuard } from '../../guards/user-auth.guard';

@Controller()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('departments'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const departments = await this.departmentService.findAll(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
    );
    return successResponse({
      message: 'Departments fetched successfully',
      data: departments,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_departments'))
  async getAllDepartments(@Req() req) {
    const departments = await this.departmentService.getAllDepartments(
      req.headers['company-id'],
    );
    return successResponse({
      message: 'Departments fetched successfully',
      data: departments,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('department_detail'))
  async findOne(@Param('id') id: string) {
    const department = await this.departmentService.findOne(id);
    return successResponse({
      message: 'Department fetched successfully',
      data: department,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_department'))
  async create(@Req() req, @Body() dto: CreateDepartmentDto) {
    const department = await this.departmentService.create(
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Department created successfully',
      data: department,
      statusCode: 201,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_department'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentService.update(
      id,
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Department updated successfully',
      data: department,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_department'))
  async remove(@Req() req, @Param('id') id: string) {
    await this.departmentService.remove(
      id,
      req.headers['company-id'],
      req.user.id,
    );
    return successResponse({ message: 'Department deleted successfully' });
  }
}
