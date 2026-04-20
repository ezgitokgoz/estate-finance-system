import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'Sunset Blvd. 12', description: 'The physical address of the property' })
  @IsString()
  @IsNotEmpty()
  propertyAddress!: string;

  @ApiProperty({ example: 150000, description: 'Total service fee in TL' })
  @IsNumber()
  @Min(0)
  totalServiceFee!: number;

  @ApiProperty({ example: 'John Doe', description: 'Agent who is listing the property' })
  @IsString()
  @IsNotEmpty()
  listingAgent!: string;

  @ApiProperty({ example: 'Jane Smith', description: 'Agent who is selling the property' })
  @IsString()
  @IsNotEmpty()
  sellingAgent!: string;
}