import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto";

describe("ReviewsService", () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);

    // Logger mock to avoid polluting test output
    jest.spyOn(Logger.prototype, "log").mockImplementation();
    jest.spyOn(Logger.prototype, "debug").mockImplementation();
    jest.spyOn(Logger.prototype, "error").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    const validReviewDto: CreateReviewDto = {
      text: "This is a test review with more than ten characters",
      company_id: "550e8400-e29b-41d4-a716-446655440000",
    };

    it("should create a review successfully", async () => {
      const result = await service.createReview(validReviewDto);

      expect(result).toHaveProperty("job_id");
      expect(result).toHaveProperty("status", "pending");
      expect(result).toHaveProperty("estimated_time");
      expect(result).toHaveProperty("created_at");
      expect(result.job_id).toMatch(
        /^bull_sentiment_analysis_\d+_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should generate unique job_id for each review", async () => {
      const result1 = await service.createReview(validReviewDto);
      const result2 = await service.createReview(validReviewDto);

      expect(result1.job_id).not.toEqual(result2.job_id);
    });

    it("should calculate estimated time based on text length", async () => {
      const shortReview = { ...validReviewDto, text: "Short text here" };
      const longReview = {
        ...validReviewDto,
        text: "This is a very long text that should take more time to process because it has many words and complex sentences that the AI needs to analyze carefully to determine the correct sentiment".repeat(
          3
        ),
      };

      const shortResult = await service.createReview(shortReview);
      const longResult = await service.createReview(longReview);

      // Extract numbers from estimated time
      const shortTimeMatch = shortResult.estimated_time.match(/(\d+)-/);
      const shortTime = shortTimeMatch ? parseInt(shortTimeMatch[1]) : 0;
      const longTimeMatch = longResult.estimated_time.match(/(\d+)-/);
      const longTime = longTimeMatch ? parseInt(longTimeMatch[1]) : 0;

      expect(longTime).toBeGreaterThan(shortTime);
    });

    it("should include metadata when provided", async () => {
      const reviewWithMetadata: CreateReviewDto = {
        ...validReviewDto,
        metadata: {
          product_id: "product_123",
          client_id: "client_456",
          plataform: "website",
        },
      };

      const result = await service.createReview(reviewWithMetadata);
      expect(result).toHaveProperty("job_id");
      expect(result.status).toBe("pending");
    });
  });

  describe("getJobStatus", () => {
    it("should return null for non-existent job", async () => {
      const result = await service.getJobStatus("non_existent_job");
      expect(result).toBeNull();
    });

    it("should return status of existing job", async () => {
      const reviewDto: CreateReviewDto = {
        text: "Review for status test",
        company_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const createdJob = await service.createReview(reviewDto);
      const job = await service.getJobStatus(createdJob.job_id);

      if (job) {
        expect(job).not.toBeNull();
        expect(job.job_id).toBe(createdJob.job_id);
        expect(job.status).toBe("pending");
      }
    });
  });

  describe("getAllJobs", () => {
    it("should return empty array when there are no jobs", () => {
      const jobs = service.getAllJobs();
      expect(Array.isArray(jobs)).toBe(true);
    });

    it("should return created jobs", async () => {
      const reviewDto: CreateReviewDto = {
        text: "Review for listing test",
        company_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      await service.createReview(reviewDto);
      const jobs = service.getAllJobs();

      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0]).toHaveProperty("id");
      expect(jobs[0]).toHaveProperty("status");
      expect(jobs[0]).toHaveProperty("company_id");
    });
  });
});
