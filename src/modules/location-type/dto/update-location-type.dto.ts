import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateLocationTypeDto {
  @ApiProperty({ example: 'Warehouse', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
