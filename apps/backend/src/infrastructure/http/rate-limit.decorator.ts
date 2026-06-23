import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_METADATA = "caninany:rate-limit";

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export const RateLimit = (options: RateLimitOptions): MethodDecorator =>
  SetMetadata(RATE_LIMIT_METADATA, options);
