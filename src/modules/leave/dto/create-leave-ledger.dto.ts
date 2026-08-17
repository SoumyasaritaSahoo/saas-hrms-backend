import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { LeaveTransactionType } from 'src/common/constants/leave-transaction-type.constant';

export class CreateLeaveLedgerDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  leave_type_id: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  leave_request_id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_type: LeaveTransactionType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  days: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  balance_after: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accrual_period?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  created_by?: string;
}
