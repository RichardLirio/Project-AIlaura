import { ConfigService } from "@nestjs/config";
import { BullRootModuleOptions } from "@nestjs/bullmq";

export const getRedisConfig = (
  configService: ConfigService
): BullRootModuleOptions => ({
  connection: {
    host: configService.get<string>("REDIS_HOST", "localhost"),
    port: configService.get<number>("REDIS_PORT", 6379),
    password: configService.get<string>("REDIS_PASSWORD") || undefined,
    db: configService.get<number>("REDIS_DB", 0),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    // Configurações para desenvolvimento
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Manter apenas 10 jobs completos
    removeOnFail: 5, // Manter apenas 5 jobs falhados
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
