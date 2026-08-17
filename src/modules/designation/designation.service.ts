import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Designation } from '../../database/models/designation.model';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { AuditService } from '../audit/audit.service';
import { User } from 'src/database/models/user.model';

@Injectable()
export class DesignationService {
  constructor(
    @InjectModel(Designation)
    private readonly designationModel: typeof Designation,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly auditService: AuditService,
  ) {}

  async create(companyId: string, userId: string, dto: CreateDesignationDto) {
    const existing = await this.designationModel.findOne({
      where: { company_id: companyId, name: dto.name },
    });
    if (existing)
      throw new BadRequestException(
        'Designation with this name already exists',
      );

    const designation = await this.designationModel.create({
      company_id: companyId,
      name: dto.name,
      level: dto.level ?? null,
    });

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Created designation',
      resourceType: 'Designation',
      resourceId: designation.id,
      newValues: { name: dto.name, level: dto.level },
    });

    return designation;
  }

  async update(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateDesignationDto,
  ) {
    const designation = await this.designationModel.findOne({
      where: { id: id },
    });
    if (!designation) throw new NotFoundException('Designation not found');

    if (dto.name && dto.name !== designation.name) {
      const existing = await this.designationModel.findOne({
        where: {
          company_id: designation.company_id,
          name: dto.name,
          id: { [Op.ne]: id },
        },
      });
      if (existing)
        throw new BadRequestException(
          'Designation with this name already exists',
        );
      designation.name = dto.name;
    }

    if (dto.level !== undefined) {
      designation.level = dto.level;
    }

    await designation.save();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Updated designation',
      resourceType: 'Designation',
      resourceId: id,
      newValues: { name: dto.name, level: dto.level },
    });

    return this.findOne(id);
  }

  async remove(id: string, companyId: string, userId: string) {
    const designation = await this.designationModel.findOne({
      where: { id: id },
    });
    if (!designation) throw new NotFoundException('Designation not found');

    const userCount = await this.userModel.count({
      where: { designation_id: id },
    });
    if (userCount > 0)
      throw new BadRequestException(
        'Cannot delete designation with assigned users',
      );

    await designation.save();
    await designation.destroy();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Deleted designation',
      resourceType: 'Designation',
      resourceId: id,
    });
  }

  async findAll(companyId: string, page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await this.designationModel.findAndCountAll({
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

  async findOne(id: string) {
    const designation = await this.designationModel.findOne({
      where: { id: id },
    });
    if (!designation) throw new NotFoundException('Designation not found');
    return designation;
  }

  async getAllDesignations(companyId: string) {
    const designations = await this.designationModel.findAll({
      where: { company_id: companyId },
    });
    if (!designations) throw new NotFoundException('Designations not found');
    return designations;
  }
}
