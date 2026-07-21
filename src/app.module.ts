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

dotenv.config();

// NOTE: simplified from the source project. app.module.ts originally wired
// up every feature module (industry, location-type, location, role,
// department, designation, common, saas-role, saas-permission, permission,
// holiday, leave, attendance, audit, admin-dashboard, dashboard, cron) plus
// ScheduleModule.forRoot(). This auth-only port keeps just AuthModule,
// UserModule, CompanyModule and MailModule — the modules AuthModule
// actually depends on — and the SequelizeModule wired to the trimmed
// DATABASE_MODELS list (see database/models/index.ts).
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
