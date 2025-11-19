import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class OrderRequestDTO {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
