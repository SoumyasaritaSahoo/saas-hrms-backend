import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLog } from 'src/database/models/audit-log.model';
import { User } from 'src/database/models/user.model';
import { Company } from 'src/database/models/company.model';

interface AuditLogInput {
  companyId?: string;
  actorId?: string;
  actorType: 'user' | 'saas_admin' | 'system';
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditLogModel: typeof AuditLog,
  ) {}

  async log(input: AuditLogInput) {
    await this.auditLogModel.create({
      company_id: input.companyId ?? null,
      actor_id: input.actorId || null,
      actor_type: input.actorType,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId || null,
      old_values: input.oldValues ?? null,
      new_values: input.newValues ?? null,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    });
  }

  async findAllByCompany(
    companyId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await this.auditLogModel.findAndCountAll({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: 'actor',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
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
}
