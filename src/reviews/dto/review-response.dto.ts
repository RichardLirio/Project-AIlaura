import { ApiProperty } from "@nestjs/swagger";

export class ReviewResponseDto {
  @ApiProperty({
    example: true,
    description: "Request status",
  })
  success: boolean;

  @ApiProperty({
    description: "Created job data",
    example: {
      job_id: "bull_sentiment_analysis_12345",
      status: "pending",
      estimated_time: "30-60 seconds",
    },
  })
  data: {
    job_id: string;
    status: string;
    estimated_time: string;
  };
}

export class ReviewErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    example: "validation_error",
    description: "Error type",
  })
  error: string;

  @ApiProperty({
    example: "Text must be between 10 and 5000 characters",
    description: "Error message",
  })
  message: string;

  @ApiProperty({
    example: "INVALID_TEXT_LENGTH",
    description: "Error code",
  })
  code: string;
}
