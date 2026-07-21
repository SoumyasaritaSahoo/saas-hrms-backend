import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyService } from './company.service';
import { CompanyMetaService } from './company-meta.service';
import { CompanyController } from './company.controller';
import { Company } from '../../database/models/company.model';
import { CompanyMeta } from '../../database/models/company-meta.model';
import { Industry } from '../../database/models/industry.model';
import { UserModule } from '../user/user.module';

// NOTE: simplified from the source project. CompanyModule originally also
// imported IndustryModule, LocationTypeModule, LocationModule,
// DepartmentModule, DesignationModule, RoleModule, StorageModule,
// LeaveModule and AttendanceModule — all needed only by the full company
// "onboarding wizard" (CompanyService.create()) and by logo upload, which
// were dropped from CompanyService/CompanyController for this auth-only
// port (see company.service.ts). What remains — company registration
// bootstrap, company read/update, company meta — only needs the models
// below plus UserModule.
@Module({
  imports: [
    SequelizeModule.forFeature([Company, Industry, CompanyMeta]),
    UserModule,
  ],
  providers: [CompanyService, CompanyMetaService],
  exports: [CompanyService, CompanyMetaService],
  controllers: [CompanyController],
})
export class CompanyModule {}
