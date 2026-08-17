import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Location } from '../../database/models/location.model';
import { LocationType } from '../../database/models/location-type.model';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [SequelizeModule.forFeature([Location, LocationType])],
  providers: [LocationService],
  exports: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
