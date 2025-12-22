import {
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateRaffleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @Min(1)
  ticketPrice: number;

  @IsInt()
  @Min(1)
  totalTickets: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  slug: string;
}
