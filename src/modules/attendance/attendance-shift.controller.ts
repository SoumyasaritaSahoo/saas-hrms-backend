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
import { AttendanceShiftService } from './attendance-shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Controller()
export class AttendanceShiftController {
  constructor(private readonly shiftService: AttendanceShiftService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('attendance_shifts'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.shiftService.findAll(
      req.headers['company-id'],
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      type,
      status,
      search,
    );
    return successResponse({
      message: 'Attendance shifts fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('get_all_attendance_shifts'))
  async getAll(@Req() req) {
    const shifts = await this.shiftService.getAll(req.headers['company-id']);
    return successResponse({
      message: 'Attendance shifts fetched successfully',
      data: shifts,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('attendance_shift_detail'))
  async findOne(@Param('id') id: string) {
    const shift = await this.shiftService.findOne(id);
    return successResponse({
      message: 'Attendance shift fetched successfully',
      data: shift,
    });
  }

  @UseGuards(UserAuthGuard)
  @Post(getAppRoute('create_attendance_shift'))
  async create(@Req() req, @Body() dto: CreateShiftDto) {
    const shift = await this.shiftService.create(
      req.headers['company-id'],
      req.user.id,
      dto,
    );
    return successResponse({
      message: 'Attendance shift created successfully',
      data: shift,
      statusCode: 201,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_attendance_shift'))
  async update(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    const shift = await this.shiftService.update(id, req.user.id, dto);
    return successResponse({
      message: 'Attendance shift updated successfully',
      data: shift,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('toggle_attendance_shift'))
  async toggleStatus(@Req() req, @Param('id') id: string) {
    const shift = await this.shiftService.toggleStatus(id, req.user.id);
    return successResponse({
      message: `Attendance shift ${shift.status ? 'activated' : 'deactivated'} successfully`,
      data: shift,
    });
  }

  @UseGuards(UserAuthGuard)
  @Delete(getAppRoute('remove_attendance_shift'))
  async remove(@Param('id') id: string) {
    await this.shiftService.remove(id);
    return successResponse({ message: 'Attendance shift deleted successfully' });
  }
}
