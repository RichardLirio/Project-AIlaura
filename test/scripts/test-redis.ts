import { Redis } from "ioredis";

async function testRedis() {
  console.log("🔄 Testando conexão com Redis...");

  const redis = new Redis({
    host: "localhost",
    port: 6379,
    lazyConnect: true,
  });

  try {
    await redis.connect();
    console.log("✅ Conexão estabelecida!");

    // Teste básico de write/read
    await redis.set("test-key", "test-value");
    const value = await redis.get("test-key");

    if (value === "test-value") {
      console.log("✅ Write/Read funcionando!");
    } else {
      console.log("❌ Problema no Write/Read");
    }

    await redis.del("test-key");
    console.log("✅ Limpeza realizada");
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);
  } finally {
    redis.disconnect();
    console.log("🔌 Conexão encerrada");
  }
}

testRedis();
