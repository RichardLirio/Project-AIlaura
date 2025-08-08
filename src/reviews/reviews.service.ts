import { Injectable, Logger } from "@nestjs/common";
import { CreateReviewDto } from "./dto";
import { randomUUID } from "node:crypto";
import { CreateReviewResult, JobStatusResponse, ReviewJob } from "./interfaces";

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  // Mock storage para simular jobs
  private readonly jobs = new Map<string, ReviewJob>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async createReview(
    createReviewDto: CreateReviewDto
  ): Promise<CreateReviewResult> {
    const startTime = Date.now();

    this.logger.log(
      `New review received from the company: ${createReviewDto.company_id}`
    );
    this.logger.debug(
      `📊 Review details: ${JSON.stringify({
        textLength: createReviewDto.text.length,
        hasMetadata: !!createReviewDto.metadata,
        metadataKeys: createReviewDto.metadata
          ? Object.keys(createReviewDto.metadata)
          : [],
      })}`
    );

    try {
      const jobId = this.generateJobId();

      // Calcular tempo estimado baseado na complexidade do texto
      const estimatedTime = this.calculateEstimatedTime(createReviewDto.text);

      // Criar entrada do job no mock storage
      const jobData = {
        id: jobId,
        review: createReviewDto,
        status: "pending" as const,
        created_at: new Date(),
        estimated_completion: new Date(
          Date.now() + this.parseEstimatedTime(estimatedTime) * 1000
        ),
      };

      this.jobs.set(jobId, jobData);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `✅ Job created successfully: ${jobId} (processing: ${processingTime}ms)`
      );

      return {
        job_id: jobId,
        status: "pending",
        estimated_time: estimatedTime,
        created_at: jobData.created_at,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `❌ Error creating job (${processingTime}ms):`,
        error.stack
      );
      throw error;
    }
  }

  private generateJobId(): string {
    const timestamp = Date.now();
    const random = randomUUID();
    const prefix = "bull_sentiment_analysis";

    return `${prefix}_${timestamp}_${random}`;
  }

  private calculateEstimatedTime(text: string): string {
    const baseTime = 30; // 30 segundos base
    const textComplexity = this.analyzeTextComplexity(text);

    // Tempo baseado na complexidade: 30s a 120s
    const minSeconds = baseTime + textComplexity.lengthFactor * 10;
    const maxSeconds = minSeconds + 30;

    this.logger.debug(
      `⏱️ Calculated estimated time: ${minSeconds}-${maxSeconds}s (complexity: ${JSON.stringify(
        textComplexity
      )})`
    );

    return `${minSeconds}-${maxSeconds} seconds`;
  }

  private analyzeTextComplexity(text: string) {
    const words = text.trim().split(/\s+/).length;
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;

    return {
      lengthFactor: Math.min(Math.floor(text.length / 200), 9), // 0-9 baseado no tamanho
      wordCount: words,
      sentenceCount: sentences,
      avgWordsPerSentence: sentences > 0 ? Math.round(words / sentences) : 0,
    };
  }

  private parseEstimatedTime(estimatedTime: string): number {
    const match = estimatedTime.match(/(\d+)-(\d+)\s+seconds/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return (min + max) / 2;
    }
    return 45; // fallback
  }

  // Método para debug/monitoring - listar todos os jobs
  getAllJobs() {
    return Array.from(this.jobs.entries()).map(([id, job]) => ({
      id,
      status: job.status,
      created_at: job.created_at,
      company_id: job.review.company_id,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getJobStatus(
    job_id: string
  ): Promise<Partial<JobStatusResponse> | null> {
    const job = this.jobs.get(job_id);
    if (!job) {
      return null;
    }

    return {
      job_id: job.id,
      status: job.status,
      created_at: job.created_at,
      estimated_completion: job.estimated_completion,
      result: job.result,
    };
  }

  // Método para cleanup - remover jobs antigos
  cleanupOldJobs(olderThanHours: number = 24) {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    let removedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.created_at.getTime() < cutoffTime) {
        this.jobs.delete(jobId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(
        `🧹 Cleanup executado: ${removedCount} jobs antigos removidos`
      );
    }

    return removedCount;
  }
}
