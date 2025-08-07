import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from "class-validator";

class ReviewMetadataDto {
  @ApiProperty({ required: false, description: "Reviewed product ID" })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiProperty({
    required: false,
    description: "ID of the customer who made the review",
  })
  @IsOptional()
  @IsString()
  client_id?: string;

  @ApiProperty({ required: false, description: "IAssessment origin platform" })
  @IsOptional()
  @IsString()
  plataform?: string;
}

export class CreateReviewDto {
  @ApiProperty({
    description: "Text review",
    minLength: 10,
    maxLength: 5000,
    example:
      "Excellent product, I highly recommend it! Great quality and fast delivery.",
  })
  @IsString()
  @Length(10, 5000)
  text: string;

  @ApiProperty({
    description: "ID of the company submitting the review",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID(4, { message: "company_id must be a valid UUID" })
  company_id: string;

  @ApiProperty({
    required: false,
    description: "Additional metadata about the assessment",
    type: ReviewMetadataDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ReviewMetadataDto)
  metadata?: ReviewMetadataDto;
}
