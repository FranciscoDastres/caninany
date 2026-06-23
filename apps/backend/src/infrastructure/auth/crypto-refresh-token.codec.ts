import { createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type {
  EncodedRefreshToken,
  ParsedRefreshToken,
  RefreshTokenCodec,
} from "../../application/ports/refresh-token.port";

@Injectable()
export class CryptoRefreshTokenCodec implements RefreshTokenCodec {
  create(sessionId: string): EncodedRefreshToken {
    const secret = randomBytes(32).toString("base64url");
    return {
      hash: this.hash(secret),
      raw: `${sessionId}.${secret}`,
    };
  }

  parse(raw: string): ParsedRefreshToken | null {
    const separator = raw.indexOf(".");
    if (separator <= 0 || separator === raw.length - 1) return null;

    const sessionId = raw.slice(0, separator);
    const secret = raw.slice(separator + 1);
    if (!/^[0-9a-f-]{36}$/i.test(sessionId) || secret.length < 32) return null;

    return { hash: this.hash(secret), sessionId };
  }

  private hash(value: string): string {
    return createHash("sha256").update(value).digest("base64url");
  }
}
