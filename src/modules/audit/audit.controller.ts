import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { getAppRoute, successResponse } from 'src/common/helpers/helper';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('audit_logs'))
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const companyId = req.headers['company-id'];
    const result = await this.auditService.findAllByCompany(
      companyId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
    return successResponse({
      message: 'Audit logs fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }
}
