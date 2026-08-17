import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LocationType } from '../../database/models/location-type.model';
import { Location } from '../../database/models/location.model';
import { LocationTypeController } from './location-type.controller';
import { LocationTypeService } from './location-type.service';

@Module({
  imports: [SequelizeModule.forFeature([LocationType, Location])],
  controllers: [LocationTypeController],
  providers: [LocationTypeService],
  exports: [LocationTypeService],
})
export class LocationTypeModule {}
