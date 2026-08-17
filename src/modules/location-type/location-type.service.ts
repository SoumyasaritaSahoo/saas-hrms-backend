import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { LocationType } from '../../database/models/location-type.model';
import { Location } from '../../database/models/location.model';
import { CreateLocationTypeDto } from './dto/create-location-type.dto';
import { UpdateLocationTypeDto } from './dto/update-location-type.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LocationTypeService {
  constructor(private readonly auditService: AuditService) {}

  async create(
    companyId: string,
    _creatorId: string,
    dto: CreateLocationTypeDto,
  ) {
    const locationType = await LocationType.create({
      company_id: companyId,
      name: dto.name,
      is_default: dto.is_default ?? false,
    });

    await this.auditService.log({
      companyId,
      actorId: _creatorId,
      actorType: 'user',
      action: 'Created location type',
      resourceType: 'LocationType',
      resourceId: locationType.id,
      newValues: { name: dto.name },
    });

    return locationType;
  }

  async findAll(companyId: string, page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await LocationType.findAndCountAll({
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
    const locationType = await LocationType.findByPk(id, {
      include: [{ model: Location }],
    });

    if (!locationType) {
      throw new NotFoundException('Location type not found');
    }

    return locationType;
  }

  async update(id: string, _updaterId: string, dto: UpdateLocationTypeDto) {
    const locationType = await LocationType.findByPk(id);

    if (!locationType) {
      throw new NotFoundException('Location type not found');
    }

    const updates: any = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.is_default !== undefined) updates.is_default = dto.is_default;

    await locationType.update(updates);

    await this.auditService.log({
      companyId: locationType.company_id,
      actorId: _updaterId,
      actorType: 'user',
      action: 'Updated location type',
      resourceType: 'LocationType',
      resourceId: id,
      newValues: { name: dto.name },
    });

    return this.findOne(id);
  }

  async remove(id: string, _deleterId: string) {
    const locationType = await LocationType.findByPk(id);

    if (!locationType) {
      throw new NotFoundException('Location type not found');
    }

    const activeLocations = await Location.count({
      where: {
        location_type_id: id,
        is_active: true,
      },
    });

    if (activeLocations > 0) {
      throw new BadRequestException(
        'Cannot delete location type with active locations',
      );
    }

    await Location.destroy({
      where: {
        location_type_id: id,
        is_active: false,
      },
      force: true,
    });

    await locationType.destroy();

    await this.auditService.log({
      companyId: locationType.company_id,
      actorId: _deleterId,
      actorType: 'user',
      action: 'Deleted location type',
      resourceType: 'LocationType',
      resourceId: id,
    });
  }

  async getAllLocationTypes(companyId: string) {
    const locationTypes = await LocationType.findAll({
      where: { company_id: companyId },
    });

    return locationTypes;
  }
}
