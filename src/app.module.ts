import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { Env } from "./config/env.validation";
import { ThrottlerModule } from "@nestjs/throttler";
import { ReviewsModule } from './reviews/reviews.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const validatedConfig = plainToInstance(Env, config, {
          enableImplicitConversion: true,
        });

        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });

        if (errors.length > 0) {
          throw new Error(
            "❌ Validation errors on .env file:\n" + JSON.stringify(errors, null, 2)
          );
        }

        return validatedConfig;
      },
    }), 
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl = (config.get<number>("RATE_LIMIT_TTL") ?? 60000) * 60; // 1 hour in milliseconds
        const limit = config.get<number>("RATE_LIMIT_REQUESTS") ?? 100;

        return {
          throttlers: [{ ttl, limit }],
        };
      },
    }), ReviewsModule,],
  controllers: [],
  providers: [],
})
export class AppModule {}
