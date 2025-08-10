import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ReviewsService } from "./reviews.service";
import {
  CreateReviewDto,
  ReviewResponseDto,
  ReviewErrorResponseDto,
} from "./dto";

@ApiTags("Reviews")
@Controller("api/reviews")
@UseGuards(ThrottlerGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({
    summary: "Create new review for analysis",
    description:
      "Submit a review for asynchronous sentiment analysis processing",
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 201,
    description:
      "Review created successfully and added to the processing queue",
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid data or validation error",
    type: ReviewErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: "Rate limit exceeded - too many requests",
  })
  async createReview(
    @Body() createReviewDto: CreateReviewDto
  ): Promise<ReviewResponseDto> {
    const result = await this.reviewsService.createReview(createReviewDto);

    return {
      success: true,
      data: result,
    };
  }
}
