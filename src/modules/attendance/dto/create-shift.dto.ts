import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ example: 'Morning Shift' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'start_time must be HH:MM or HH:MM:SS',
  })
  start_time: string;

  @ApiProperty({ example: '18:00:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'end_time must be HH:MM or HH:MM:SS',
  })
  end_time: string;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  break_minutes?: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(0)
  half_day_hours: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  full_day_hours: number;

  @ApiPropertyOptional({ example: 9 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime_after_hours?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  is_night_shift?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  is_flexible?: boolean;

  @ApiPropertyOptional({
    example: 15,
    description:
      'Minutes before start_time from which check-in is allowed (ignored for flexible shifts)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  before_grace_minutes?: number;

  @ApiPropertyOptional({
    example: 30,
    description:
      'Minutes after start_time before a check-in is marked late (ignored for flexible shifts)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  after_grace_minutes?: number;

  @ApiPropertyOptional({ example: '1,2,3,4,5', description: '1=Mon..7=Sun' })
  @IsString()
  @IsOptional()
  weekdays?: string;
}
