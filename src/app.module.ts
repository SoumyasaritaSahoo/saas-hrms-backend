import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { InjectConnection, SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DATABASE_MODELS } from './database/models';
import { AppMiddleware } from './middleware/middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { DepartmentModule } from './modules/department/department.module';
import { DesignationModule } from './modules/designation/designation.module';
import { LocationTypeModule } from './modules/location-type/location-type.module';
import { LocationModule } from './modules/location/location.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';
import { LeaveModule } from './modules/leave/leave.module';

dotenv.config();

// NOTE: simplified from the source project. app.module.ts originally also
// wired up industry, saas-role, saas-permission, holiday, admin-dashboard,
// dashboard, cron modules plus ScheduleModule.forRoot() — none of that is
// touched by Employee management, so it stays excluded. Everything the
// Employee-management port actually needs (department, designation,
// location-type, location, role, permission, attendance [shift-only],
// audit, storage, leave [balance-only]) is now wired in alongside the
// previously-ported AuthModule/UserModule/CompanyModule/MailModule — see
// database/models/index.ts for the matching DATABASE_MODELS list.
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadModels: false,
      synchronize: false,
      logging: console.log,
      models: DATABASE_MODELS,
      define: {
        underscored: true,
        timestamps: true,
        paranoid: true,
      },
    }),
    AuthModule,
    UserModule,
    CompanyModule,
    MailModule,
    DepartmentModule,
    DesignationModule,
    LocationTypeModule,
    LocationModule,
    RoleModule,
    PermissionModule,
    AttendanceModule,
    AuditModule,
    StorageModule,
    LeaveModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
  ) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();

      console.log('✅ PostgreSQL connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed');

      console.error(error);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).exclude('health').forRoutes('*');
    consumer.apply(RequestLoggerMiddleware).exclude('health').forRoutes('*');
  }
}
