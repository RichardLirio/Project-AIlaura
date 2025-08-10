import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import * as request from "supertest";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { randomUUID } from "node:crypto";

describe("ReviewsController (Integration)", () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let reviewsService: ReviewsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 1000, // Limite alto para não afetar os testes
          },
        ]),
      ],
      controllers: [ReviewsController],
      providers: [ReviewsService],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar ValidationPipe como na aplicação real
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();
    reviewsService = moduleFixture.get<ReviewsService>(ReviewsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/reviews", () => {
    const validPayload = {
      text: "This is a valid review with more than ten characters",
      company_id: randomUUID(),
    };

    it("should be able to create review with valid payload", () => {
      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(validPayload)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty("job_id");
          expect(res.body.data).toHaveProperty("status", "pending");
          expect(res.body.data).toHaveProperty("estimated_time");
        });
    });

    it("should be able to create a review with opcional metadata", () => {
      const payloadWithMetadata = {
        ...validPayload,
        metadata: {
          product_id: "produto_123",
          client_id: "cliente_456",
          plataform: "website",
        },
      };

      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(payloadWithMetadata)
        .expect(201);
    });

    it("should reject short texts", () => {
      const invalidPayload = {
        ...validPayload,
        text: "Curto", // Menos de 10 caracteres
      };

      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(invalidPayload)
        .expect(400)
        .expect((res) => {
          expect(res.body.message[0]).toContain("text");
        });
    });

    it("should reject invalid company_id", () => {
      const invalidPayload = {
        ...validPayload,
        company_id: "not-a-uuid",
      };

      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(invalidPayload)
        .expect(400);
    });

    it("must reject payload without required fields", () => {
      return request(app.getHttpServer())
        .post("/api/reviews")
        .send({})
        .expect(400);
    });

    it("should reject extra fields not allowed", () => {
      const payloadWithExtra = {
        ...validPayload,
        campoExtra: "shouldn't be here",
      };

      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(payloadWithExtra)
        .expect(400);
    });

    it("should reject very long text", () => {
      const invalidPayload = {
        ...validPayload,
        text: "a".repeat(5001), // Mais de 5000 caracteres
      };

      return request(app.getHttpServer())
        .post("/api/reviews")
        .send(invalidPayload)
        .expect(400);
    });
  });
});
