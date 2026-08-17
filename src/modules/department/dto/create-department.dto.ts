import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsUUID('4')
  parent_id?: string | null;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsUUID('4')
  head_user_id?: string | null;
}
