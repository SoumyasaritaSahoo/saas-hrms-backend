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
import { RoleService } from './role.service';
import { getAppRoute, successResponse } from 'src/common/helpers/helper';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('roles'))
  async findAllRoles(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const roles = await this.roleService.findAllRoles(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
    );
    return successResponse({
      message: 'Roles fetched successfully',
      data: roles,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('role_detail'))
  async findOneRole(@Param('id') id: string) {
    const role = await this.roleService.findOne(id);
    return successResponse({
      message: 'Role fetched successfully',
      data: role,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_role'))
  async create(@Req() req, @Body() dto: CreateRoleDto) {
    const role = await this.roleService.create(req.user.id, dto);
    return successResponse({
      message: 'Role created successfully',
      data: role,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_role'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: CreateRoleDto,
  ) {
    const role = await this.roleService.update(req.user.id, id, dto);
    return successResponse({
      message: 'Role updated successfully',
      data: role,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_role'))
  async remove(@Req() req, @Param('id') id: string) {
    await this.roleService.remove(req.user.id, id);
    return successResponse({ message: 'Role deleted successfully' });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_roles'))
  async getAllRoles(@Req() req) {
    const roles = await this.roleService.getAllRoles(req.headers['company-id']);
    return successResponse({
      message: 'Roles fetched successfully',
      data: roles,
    });
  }
}
