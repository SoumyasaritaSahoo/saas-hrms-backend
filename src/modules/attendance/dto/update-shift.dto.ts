import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class UpdateShiftDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'start_time must be HH:MM or HH:MM:SS' })
  start_time?: string;

  @ApiPropertyOptional({ example: '18:00:00' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'end_time must be HH:MM or HH:MM:SS' })
  end_time?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  break_minutes?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  half_day_hours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  full_day_hours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime_after_hours?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_night_shift?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_flexible?: boolean;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  before_grace_minutes?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  after_grace_minutes?: number;

  @ApiPropertyOptional({ example: '1,2,3,4,5' })
  @IsString()
  @IsOptional()
  weekdays?: string;
}
