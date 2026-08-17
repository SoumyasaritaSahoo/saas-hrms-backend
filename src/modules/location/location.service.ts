import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Location } from '../../database/models/location.model';
import { LocationType } from 'src/database/models/location-type.model';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LocationService {
  constructor(private readonly auditService: AuditService) {}

  async create(
    companyId: string,
    locationTypeId: string,
    dto: CreateLocationDto,
    userId?: string,
  ) {
    const [location] = await Location.findOrCreate({
      where: { company_id: companyId, name: dto.name },
      defaults: {
        company_id: companyId,
        location_type_id: locationTypeId,
        name: dto.name,
        address_line_1: dto.address_line_1,
        address_line_2: dto.address_line_2 ?? null,
        city: dto.city,
        state: dto.state ?? null,
        postal_code: dto.postal_code ?? null,
        country: dto.country,
        timezone: dto.timezone ?? 'Asia/Kolkata',
        is_active: dto.is_active ?? true,
      },
    });

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Created location',
      resourceType: 'Location',
      resourceId: location.id,
      newValues: { name: dto.name, city: dto.city, country: dto.country },
    });

    return location;
  }

  async findAll(companyId: string, page: number = 1, limit: number = 10, search?: string, locationTypeId?: string) {
    const offset = (page - 1) * limit;
    const where: any = { company_id: companyId };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (locationTypeId) where.location_type_id = locationTypeId;

    const { rows, count } = await Location.findAndCountAll({
      where,
      include: [{ model: LocationType }],
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
    const location = await Location.findByPk(id, {
      include: [{ model: LocationType }],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateLocationDto,
  ) {
    const location = await Location.findByPk(id);

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const updates: any = {};
    if (dto.location_type_id !== undefined)
      updates.location_type_id = dto.location_type_id;
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.address_line_1 !== undefined)
      updates.address_line_1 = dto.address_line_1;
    if (dto.address_line_2 !== undefined)
      updates.address_line_2 = dto.address_line_2;
    if (dto.city !== undefined) updates.city = dto.city;
    if (dto.state !== undefined) updates.state = dto.state;
    if (dto.postal_code !== undefined) updates.postal_code = dto.postal_code;
    if (dto.country !== undefined) updates.country = dto.country;
    if (dto.timezone !== undefined) updates.timezone = dto.timezone;
    if (dto.is_active !== undefined) updates.is_active = dto.is_active;

    await location.update(updates);

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Updated location',
      resourceType: 'Location',
      resourceId: id,
      newValues: { name: dto.name, city: dto.city, country: dto.country },
    });

    return this.findOne(id);
  }

  async remove(id: string, companyId: string, userId: string) {
    const location = await Location.findByPk(id);

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await location.destroy();

    await this.auditService.log({
      companyId,
      actorId: userId,
      actorType: 'user',
      action: 'Deleted location',
      resourceType: 'Location',
      resourceId: id,
    });
  }

  async getAllLocations(companyId: string) {
    const locations = await Location.findAll({
      where: { company_id: companyId },
    });

    return locations;
  }
}
