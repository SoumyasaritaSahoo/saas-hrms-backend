import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'john@admin.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '7846378678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  department_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  designation_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  manager_id?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  joining_date: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  location_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shift_id?: string;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional({ example: 'B.Tech' })
  @IsOptional()
  @IsString()
  highest_qualification?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  experience_years?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_married?: boolean;

  @ApiPropertyOptional({ example: '7846378678' })
  @IsOptional()
  @IsString()
  emergency_contact_number?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  emergency_contact_name?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsOptional()
  @IsString()
  emergency_contact_relation?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  base_salary?: number;

  @ApiPropertyOptional({
    enum: ['full_time', 'part_time', 'contract', 'internship', 'temporary'],
  })
  @IsOptional()
  @IsEnum(['full_time', 'part_time', 'contract', 'internship', 'temporary'])
  employment_type?: string;

  @ApiPropertyOptional({
    enum: ['probation', 'confirmed', 'notice_period', 'resigned', 'terminated'],
  })
  @IsOptional()
  @IsEnum(['probation', 'confirmed', 'notice_period', 'resigned', 'terminated'])
  employment_status?: string;

  @ApiPropertyOptional({ enum: ['on_site', 'remote', 'hybrid'] })
  @IsOptional()
  @IsEnum(['on_site', 'remote', 'hybrid'])
  work_mode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
