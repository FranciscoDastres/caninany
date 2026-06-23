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
    PUBLIC_API_URL: z.string().url().default("http://localhost:3000/api/v1"),
    APP_PUBLIC_URL: z.string().url().default("http://localhost:5173"),
    MAIL_MODE: z.enum(["log", "resend"]).default("log"),
    MAIL_FROM: z.string().min(3).default("Caninany <no-reply@caninany.cl>"),
    RESEND_API_KEY: z.union([z.string().min(1), z.literal("")]).optional(),
    GOOGLE_CLIENT_ID: z.union([z.string().min(1), z.literal("")]).optional(),
    UPLOADS_DIR: z.string().default("./uploads"),
    ADMIN_EMAIL: z.union([z.email(), z.literal("")]).optional(),
    ADMIN_PASSWORD: z.union([z.string().min(12), z.literal("")]).optional(),
    ADMIN_NAME: z.union([z.string().min(2), z.literal("")]).optional(),
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
  )
  .refine(
    (environment) =>
      environment.MAIL_MODE !== "resend" || Boolean(environment.RESEND_API_KEY),
    {
      message: "RESEND_API_KEY is required when MAIL_MODE=resend.",
      path: ["RESEND_API_KEY"],
    },
  )
  .refine(
    (environment) => {
      const adminValues = [
        environment.ADMIN_EMAIL,
        environment.ADMIN_PASSWORD,
        environment.ADMIN_NAME,
      ].filter(Boolean);
      return adminValues.length === 0 || adminValues.length === 3;
    },
    {
      message:
        "ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME must be configured together.",
    },
  );

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  return environmentSchema.parse(values);
}
