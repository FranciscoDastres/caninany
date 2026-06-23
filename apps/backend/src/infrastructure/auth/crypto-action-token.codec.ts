import { createHash, randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type {
  ActionToken,
  ActionTokenCodec,
} from "../../application/ports/action-token.port";

@Injectable()
export class CryptoActionTokenCodec implements ActionTokenCodec {
  create(): ActionToken {
    const raw = randomBytes(32).toString("base64url");
    return { raw, hash: this.hash(raw) };
  }

  hash(raw: string): string {
    return createHash("sha256").update(raw).digest("base64url");
  }
}
