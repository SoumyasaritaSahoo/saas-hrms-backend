import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import {
  getAdminRoute,
  getAppRoute,
  successResponse,
} from '../../common/helpers/helper';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

// NOTE: simplified from the source project. UserController originally also
// exposed employee CRUD (list/detail/create/update/remove, gated by
// PermissionsGuard + RequirePermissions), profile picture upload/removal,
// document upload/removal, and SaaS admin user CRUD. All of that depended
// on feature modules excluded from this auth-only port (department,
// designation, role/permission, location, storage) — see user.service.ts.
// What remains is self-service profile and admin profile, mirroring the
// login/session flows in AuthController.
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('profile'))
  async getProfile(@Req() req) {
    const user = await this.userService.getUserProfile(req.user.id);
    return successResponse({
      message: 'Profile fetched successfully',
      data: user,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('profile'))
  async updateMyProfile(@Req() req, @Body() dto: UpdateUserProfileDto) {
    const user = await this.userService.updateProfile(req.user.id, dto);
    return successResponse({
      message: 'Profile updated successfully',
      data: user,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get(getAdminRoute('profile'))
  async getAdminProfile(@Req() req) {
    const user = await this.userService.getAdminProfile(req.user.id);
    return successResponse({
      message: 'Profile fetched successfully',
      data: user,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Put(getAdminRoute('profile'))
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    const user = await this.userService.updateAdminProfile(req.user.id, dto);
    return successResponse({
      message: 'Profile updated successfully',
      data: user,
    });
  }
}
