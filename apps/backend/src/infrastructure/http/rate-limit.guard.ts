import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

import {
  RATE_LIMIT_METADATA,
  type RateLimitOptions,
} from "./rate-limit.decorator";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const key = `${request.ip}:${request.method}:${request.route?.path ?? request.path}`;
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + options.windowMs });
      this.pruneExpired(now);
      return true;
    }

    current.count += 1;
    if (current.count > options.limit) {
      throw new HttpException(
        "Demasiados intentos. Intenta nuevamente más tarde.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private pruneExpired(now: number): void {
    if (this.entries.size < 1_000) return;
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(key);
    }
  }
}
