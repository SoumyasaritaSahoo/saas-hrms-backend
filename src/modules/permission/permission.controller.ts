import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { getAppRoute, successResponse } from 'src/common/helpers/helper';

@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('permissions'))
  async findAllPermissions() {
    const permissions = await this.permissionService.findAll();
    return successResponse({
      message: 'Permissions fetched successfully',
      data: permissions,
    });
  }
}
