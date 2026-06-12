import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const config = app.get(ConfigService);
  const origins = config
    .getOrThrow<string>("CORS_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    credentials: true,
    origin: origins,
  });
  app.use(helmet());
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Caninany API")
    .setDescription("API for veterinary hygiene appointment scheduling.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(config.getOrThrow<number>("PORT"), "0.0.0.0");
}

void bootstrap();
