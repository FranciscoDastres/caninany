import type {
  AuthResponseDto,
  AuthUserDto,
  LoginInput,
  RegisterInput,
} from "@caninany/shared";

import type { PasswordHasher } from "../ports/password-hasher.port";
import type { TokenIssuer } from "../ports/token-issuer.port";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  UserNotFoundError,
} from "../../domain/errors/domain.error";
import type { UserRepository } from "../../domain/repositories/user.repository";

export class AuthApplicationService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenIssuer,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponseDto> {
    if (await this.users.findByEmail(input.email)) {
      throw new EmailAlreadyRegisteredError(
        "Ya existe una cuenta con este correo.",
      );
    }

    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash: await this.passwords.hash(input.password),
      role: "cliente",
    });

    return this.createSession(user);
  }

  async login(input: LoginInput): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(input.email);
    if (
      !user ||
      !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new InvalidCredentialsError("Correo o contraseña incorrectos.");
    }

    return this.createSession(user);
  }

  async getCurrentUser(userId: string): Promise<AuthUserDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundError("La cuenta ya no existe.");
    }

    return this.toDto(user);
  }

  private async createSession(
    user: Awaited<ReturnType<UserRepository["create"]>>,
  ): Promise<AuthResponseDto> {
    return {
      accessToken: await this.tokens.issue({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      user: this.toDto(user),
    };
  }

  private toDto(
    user: Awaited<ReturnType<UserRepository["create"]>>,
  ): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
