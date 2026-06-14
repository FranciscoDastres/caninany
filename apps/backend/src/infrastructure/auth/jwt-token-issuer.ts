import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type {
  AccessTokenPayload,
  TokenIssuer,
} from "../../application/ports/token-issuer.port";

@Injectable()
export class JwtTokenIssuer implements TokenIssuer {
  constructor(private readonly jwt: JwtService) {}

  issue(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync({
      sub: payload.userId,
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });
  }
}
