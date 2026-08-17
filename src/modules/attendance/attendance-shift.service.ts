import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AttendanceShift } from '../../database/models/attendance-shift.model';
import { User } from '../../database/models/user.model';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { DEFAULT_ATTENDANCE_SHIFT } from 'src/common/constants/default-shift.contant';

@Injectable()
export class AttendanceShiftService {
  constructor(
    @InjectModel(AttendanceShift)
    private readonly shiftModel: typeof AttendanceShift,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    type?: string,
    status?: string,
    search?: string,
  ) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };

    if (type === 'night') {
      where.is_night_shift = true;
    } else if (type === 'flexible') {
      where.is_flexible = true;
    } else if (type === 'regular') {
      where.is_night_shift = false;
      where.is_flexible = false;
    }

    if (status === 'active') {
      where.status = true;
    } else if (status === 'inactive') {
      where.status = false;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await this.shiftModel.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit),
      },
    };
  }

  async getAll(companyId: string) {
    return this.shiftModel.findAll({
      where: { company_id: companyId, status: true },
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: string) {
    const shift = await this.shiftModel.findByPk(id);
    if (!shift) throw new NotFoundException('Attendance shift not found');
    return shift;
  }

  async create(companyId: string, userId: string, dto: CreateShiftDto) {
    const existing = await this.shiftModel.findOne({
      where: { company_id: companyId, code: dto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException(
        'A shift with this code already exists for this company',
      );
    }

    return this.shiftModel.create({
      company_id: companyId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      start_time: dto.start_time,
      end_time: dto.end_time,
      break_minutes: dto.break_minutes ?? 0,
      half_day_hours: dto.half_day_hours,
      full_day_hours: dto.full_day_hours,
      overtime_after_hours: dto.overtime_after_hours ?? null,
      is_night_shift: dto.is_night_shift ?? false,
      is_flexible: dto.is_flexible ?? false,
      before_grace_minutes: dto.before_grace_minutes ?? 0,
      after_grace_minutes: dto.after_grace_minutes ?? 0,
      weekdays: dto.weekdays ?? null,
      status: true,
      created_by: userId,
    });
  }

  async update(id: string, userId: string, dto: UpdateShiftDto) {
    const shift = await this.shiftModel.findByPk(id);
    if (!shift) throw new NotFoundException('Attendance shift not found');

    if (dto.code && dto.code.toUpperCase() !== shift.code) {
      const existing = await this.shiftModel.findOne({
        where: {
          company_id: shift.company_id,
          code: dto.code.toUpperCase(),
          id: { [Op.ne]: id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          'A shift with this code already exists for this company',
        );
      }
    }

    await shift.update({
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
      ...(dto.start_time !== undefined && { start_time: dto.start_time }),
      ...(dto.end_time !== undefined && { end_time: dto.end_time }),
      ...(dto.break_minutes !== undefined && {
        break_minutes: dto.break_minutes,
      }),
      ...(dto.half_day_hours !== undefined && {
        half_day_hours: dto.half_day_hours,
      }),
      ...(dto.full_day_hours !== undefined && {
        full_day_hours: dto.full_day_hours,
      }),
      ...(dto.overtime_after_hours !== undefined && {
        overtime_after_hours: dto.overtime_after_hours,
      }),
      ...(dto.is_night_shift !== undefined && {
        is_night_shift: dto.is_night_shift,
      }),
      ...(dto.is_flexible !== undefined && { is_flexible: dto.is_flexible }),
      ...(dto.before_grace_minutes !== undefined && {
        before_grace_minutes: dto.before_grace_minutes,
      }),
      ...(dto.after_grace_minutes !== undefined && {
        after_grace_minutes: dto.after_grace_minutes,
      }),
      ...(dto.weekdays !== undefined && { weekdays: dto.weekdays }),
      updated_by: userId,
    });

    return shift.reload();
  }

  async toggleStatus(id: string, userId: string) {
    const shift = await this.shiftModel.findByPk(id);
    if (!shift) throw new NotFoundException('Attendance shift not found');

    await shift.update({ status: !shift.status, updated_by: userId });
    return shift.reload();
  }

  async remove(id: string) {
    const shift = await this.shiftModel.findByPk(id);
    if (!shift) throw new NotFoundException('Attendance shift not found');

    const assignedUsers = await this.userModel.count({
      where: { shift_id: id },
    });

    if (assignedUsers > 0) {
      throw new BadRequestException(
        'Cannot delete this shift because it has assigned employees. Please reassign them before deleting.',
      );
    }

    await shift.destroy();
  }

  async createDefault(companyId: string, userId: string) {
    const existing = await this.shiftModel.findOne({
      where: {
        company_id: companyId,
        code: DEFAULT_ATTENDANCE_SHIFT.code,
      },
    });

    if (existing) {
      return existing;
    }

    return this.shiftModel.create({
      company_id: companyId,
      ...DEFAULT_ATTENDANCE_SHIFT,
      created_by: userId,
    });
  }
}
