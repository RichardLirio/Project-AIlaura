import { IsEnum, IsInt, IsNotEmpty, IsString, Matches } from "class-validator";
import { Type } from "class-transformer";

export enum Environment {
  development = "development",
  production = "production",
  test = "test",
}

export class Env {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Type(() => Number)
  PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_USER: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_DB: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^postgresql:\/\/.+/, {
    message: "DATABASE_URL must be a valid PostgreSQL connection string",
  })
  DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^redis:\/\/.+/, {
    message: "REDIS_URL must be a valid Redis connection string",
  })
  REDIS_URL: string;

  @IsInt()
  @Type(() => Number)
  RATE_LIMIT_REQUESTS: number;

  @IsInt()
  @Type(() => Number)
  RATE_LIMIT_TTL: number;
}
