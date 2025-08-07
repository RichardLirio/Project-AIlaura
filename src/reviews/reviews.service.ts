import { Injectable, Logger } from "@nestjs/common";
import { CreateReviewDto } from "./dto";

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  createReview(createReviewDto: CreateReviewDto) {
    this.logger.log(
      `New review received from the company: ${createReviewDto.company_id}`
    );
    this.logger.debug(
      `Review text length: ${createReviewDto.text.length} characters`
    );

    const jobId = `bull_sentiment_analysis_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    // Simular tempo de processamento baseado no tamanho do texto
    const estimatedSeconds =
      Math.ceil(createReviewDto.text.length / 100) * 10 + 30;
    const estimatedTime = `${estimatedSeconds}-${
      estimatedSeconds + 30
    } seconds`;

    this.logger.log(`Job created: ${jobId}`);

    return {
      job_id: jobId,
      status: "pending",
      estimated_time: estimatedTime,
    };
  }
}
