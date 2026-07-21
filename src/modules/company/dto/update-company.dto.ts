import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Company ──────────────────────────────────────────────────────────────────

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @IsNotEmpty()
  industry_id: string;

  @ApiProperty({ example: '@acme.com' })
  @IsString()
  @IsNotEmpty()
  email_domain: string;

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsString()
  logo?: string | null;

  @ApiPropertyOptional({ example: 'https://www.acme.com/' })
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional({ example: '+91 7859898257' })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'INR' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({ example: '27AABCT1234C1ZX' })
  @IsOptional()
  @IsString()
  gst_number?: string | null;

  @ApiPropertyOptional({ example: 'AABCT1234C' })
  @IsOptional()
  @IsString()
  pan_number?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  financial_year_start_month?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  financial_year_end_month?: number;

  @ApiPropertyOptional({ example: '1,2,3,4,5' })
  @IsOptional()
  @IsString()
  working_week_days?: string;

  @ApiPropertyOptional({ example: '11-50' })
  @IsOptional()
  @IsString()
  company_size?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_setup?: boolean;
}
