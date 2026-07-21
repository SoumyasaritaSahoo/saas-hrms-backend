import {
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// NOTE: simplified from the source project. The original DTO also carried
// current/permanent address fields and bank account fields, persisted via
// UserService.upsertUserAddresses()/upsertUserBankAccount() into
// UserAddress/UserBankAccount models. Those models and upsert methods were
// dropped for this auth-only port (they're HR profile extras, not part of
// authentication) — only the fields that live directly on the User model
// remain here.
export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  last_name?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

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
}
