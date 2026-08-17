import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsUUID('4')
  parent_id?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsUUID('4')
  head_user_id?: string | null;
}
