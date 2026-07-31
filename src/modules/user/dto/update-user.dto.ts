import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ example: 'john@admin.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '7846378678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designation_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  manager_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joining_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  role_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  location_id?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_address_line_1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_address_line_2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_pincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  current_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_address_line_1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_address_line_2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_pincode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanent_country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  account_holder_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  account_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ifsc_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch_name?: string;
}
