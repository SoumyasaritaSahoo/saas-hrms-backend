import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  getAdminRoute,
  getAppRoute,
  successResponse,
} from '../../common/helpers/helper';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { UserAuthGuard } from 'src/guards/user-auth.guard';
import { UpdateCompanyDto } from './dto/update-company.dto';

// NOTE: simplified from the source project. The full company "onboarding
// wizard" endpoint (POST app/create-company) and the logo upload/remove
// endpoints were dropped along with the location/department/designation/
// role/storage modules they depended on (see company.service.ts). What's
// left is read (admin list/detail, self-service detail) and update.
@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(AdminAuthGuard)
  @Get(getAdminRoute('companies'))
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.companyService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      search || undefined,
    );
    return successResponse({
      message: 'Companies fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }

  @UseGuards(AdminAuthGuard)
  @Get(getAdminRoute('company_detail'))
  async findOne(@Param('id') id: string) {
    const company = await this.companyService.findOne(id);
    return successResponse({
      message: 'Company fetched successfully',
      data: company,
    });
  }

  @UseGuards(UserAuthGuard)
  @Put(getAppRoute('update_company'))
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    const company = await this.companyService.update(id, dto);

    return successResponse({
      message: 'Company updated successfully',
      data: company,
    });
  }

  @UseGuards(UserAuthGuard)
  @Get(getAppRoute('company_detail'))
  async getCompanyDetails(@Param('id') id: string) {
    const company = await this.companyService.findOne(id);
    return successResponse({
      message: 'Company fetched successfully',
      data: company,
    });
  }
}
