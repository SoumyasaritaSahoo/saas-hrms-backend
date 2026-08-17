import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Department } from '../../database/models/department.model';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { User } from 'src/database/models/user.model';
import { Op } from 'sequelize';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department)
    private readonly departmentModel: typeof Department,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly auditService: AuditService,
  ) {}

  async findAll(companyId: string, page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await this.departmentModel.findAndCountAll({
      where,
      include: [
        { model: Department, as: 'parent' },
        { model: User, as: 'head' },
      ],
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

  async findOne(id: string) {
    const department = await this.departmentModel.findOne({
      where: { id: id },
      include: [
        { model: Department, as: 'parent' },
        { model: User, as: 'head' },
        { model: Department, as: 'children' },
      ],
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async create(companyId: string, userId: string, dto: CreateDepartmentDto) {
    const existing = await this.departmentModel.findOne({
      where: { company_id: companyId, name: dto.name },
    });
    if (existing)
      throw new BadRequestException('Department with this name already exists');

    if (dto.parent_id) {
      const parent = await this.departmentModel.findOne({
        where: { id: dto.parent_id, company_id: companyId },
      });
      if (!parent) throw new BadRequestException('Parent department not found');
    }

    if (dto.head_user_id) {
      const head = await this.userModel.findOne({
        where: { id: dto.head_user_id, company_id: companyId },
      });
      if (!head)
        throw new BadRequestException('Head user not found in this company');
    }

    const department = await this.departmentModel.create({
      company_id: companyId,
      name: dto.name,
      parent_id: dto.parent_id ?? null,
      head_user_id: dto.head_user_id ?? null,
    });

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Created department',
      resourceType: 'Department',
      resourceId: department.id,
      newValues: {
        name: dto.name,
        parent_id: dto.parent_id,
        head_user_id: dto.head_user_id,
      },
    });

    return department;
  }

  async update(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateDepartmentDto,
  ) {
    const department = await this.departmentModel.findOne({
      where: { id: id },
    });
    if (!department) throw new NotFoundException('Department not found');

    if (dto.name && dto.name !== department.name) {
      const existing = await this.departmentModel.findOne({
        where: {
          company_id: department.company_id,
          name: dto.name,
          id: { [Op.ne]: id },
        },
      });
      if (existing)
        throw new BadRequestException(
          'Department with this name already exists',
        );
      department.name = dto.name;
    }

    if (dto.parent_id !== undefined) {
      if (dto.parent_id === id)
        throw new BadRequestException('Department cannot be its own parent');
      if (dto.parent_id) {
        const parent = await this.departmentModel.findOne({
          where: { id: dto.parent_id },
        });
        if (!parent)
          throw new BadRequestException('Parent department not found');
      }
      department.parent_id = dto.parent_id;
    }

    if (dto.head_user_id !== undefined) {
      if (dto.head_user_id) {
        const head = await this.userModel.findOne({
          where: { id: dto.head_user_id },
        });
        if (!head) throw new BadRequestException('Head user not found');
      }
      department.head_user_id = dto.head_user_id;
    }

    await department.save();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Updated department',
      resourceType: 'Department',
      resourceId: id,
      newValues: {
        name: dto.name,
        parent_id: dto.parent_id,
        head_user_id: dto.head_user_id,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string, companyId: string, userId: string) {
    const department = await this.departmentModel.findOne({
      where: { id: id },
    });
    if (!department) throw new NotFoundException('Department not found');

    const childrenCount = await this.departmentModel.count({
      where: { parent_id: id },
    });
    if (childrenCount > 0)
      throw new BadRequestException(
        'Cannot delete this department because it has child departments. Please remove or reassign the child departments before deleting it.',
      );

    const userCount = await this.userModel.count({
      where: { department_id: id },
    });
    if (userCount > 0)
      throw new BadRequestException(
        'Cannot delete department because it has assigned users. Please reassign the department before deleting it.',
      );

    await department.save();
    await department.destroy();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Deleted department',
      resourceType: 'Department',
      resourceId: id,
    });
  }

  async getAllDepartments(companyId: string) {
    const departments = await this.departmentModel.findAll({
      where: { company_id: companyId },
    });
    if (!departments) throw new NotFoundException('Departments not found');
    return departments;
  }
}
