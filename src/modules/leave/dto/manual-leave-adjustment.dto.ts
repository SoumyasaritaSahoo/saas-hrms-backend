import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  NotEquals,
} from 'class-validator';

export class ManualLeaveAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  leave_type_id: string;

  @ApiProperty({
    description: 'Positive value adds leave balance, negative value deducts it',
    example: 2,
  })
  @IsNumber()
  @NotEquals(0)
  days: number;

  @ApiPropertyOptional({ example: 'Manual correction' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2026-07-07' })
  @IsDateString()
  @IsOptional()
  effective_date?: string;
}
