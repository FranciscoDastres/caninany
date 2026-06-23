import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type {
  AuthenticatedRole,
  AuthenticatedUser,
} from "./authenticated-user";
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from "../../domain/repositories/auth-session.repository";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "../../domain/repositories/user.repository";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  sessionId?: string;
  userId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(AUTH_SESSION_REPOSITORY)
    private readonly sessions: AuthSessionRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const userId = payload.userId ?? payload.sub;
    if (
      !payload.sessionId ||
      !(await this.sessions.isActive(payload.sessionId, userId, new Date()))
    ) {
      throw new UnauthorizedException("La sesión expiró o fue revocada.");
    }

    const user = await this.users.findById(userId);
    if (!user || user.status !== "active") {
      throw new UnauthorizedException("La cuenta no está activa.");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as AuthenticatedRole,
      sessionId: payload.sessionId,
    };
  }
}
