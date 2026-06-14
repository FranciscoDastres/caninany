import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import type {
  AuthenticatedRole,
  AuthenticatedUser,
} from "./authenticated-user";

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  userId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    const role = payload.role.toLowerCase();
    if (role !== "admin" && role !== "cliente") {
      throw new UnauthorizedException("Invalid user role.");
    }

    return {
      id: payload.userId ?? payload.sub,
      email: payload.email,
      name: payload.name,
      role: role as AuthenticatedRole,
    };
  }
}
