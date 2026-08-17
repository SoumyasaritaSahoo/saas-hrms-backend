import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Designation } from '../../database/models/designation.model';
import { User } from '../../database/models/user.model';
import { DesignationController } from './designation.controller';
import { DesignationService } from './designation.service';

@Module({
  imports: [SequelizeModule.forFeature([Designation, User])],
  controllers: [DesignationController],
  providers: [DesignationService],
  exports: [DesignationService],
})
export class DesignationModule {}
