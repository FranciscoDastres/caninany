import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().startsWith("postgresql://"),
    JWT_SECRET: z.string().min(32),
    CORS_ORIGINS: z.string().default("http://localhost:5173"),
    BUSINESS_TIMEZONE: z.string().default("America/Santiago"),
    BUSINESS_OPENING_HOUR: z.coerce.number().int().min(0).max(23).default(9),
    BUSINESS_CLOSING_HOUR: z.coerce.number().int().min(1).max(24).default(18),
  })
  .refine(
    (environment) =>
      environment.BUSINESS_OPENING_HOUR < environment.BUSINESS_CLOSING_HOUR,
    {
      message: "BUSINESS_OPENING_HOUR must be before BUSINESS_CLOSING_HOUR.",
    },
  );

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(values);
}
