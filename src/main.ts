import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Obtendo o ConfigService globalmente
  const configService = app.get(ConfigService);

  const port = configService.get<number>("PORT") ?? 3333;

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Sentiment Analysis System")
    .setDescription("API for AI-powered review processing")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);
  console.log(`🚀 Server is running on port:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port || 3333}/api/docs`);
}

bootstrap();
