import { Injectable } from "@nestjs/common";
import type { UserRole } from "@caninany/shared";

import {
  EmailAlreadyRegisteredError,
  UserNotFoundError,
} from "../../../../domain/errors/domain.error";
import type {
  CreateUserRecord,
  UserRecord,
  UserRepository,
  UserSummaryRecord,
} from "../../../../domain/repositories/user.repository";
import { PrismaService } from "../prisma.service";

const roleToPersistence = {
  admin: "ADMIN",
  cliente: "CLIENT",
} as const;

const roleToDomain = {
  ADMIN: "admin",
  CLIENT: "cliente",
} as const;

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserRecord): Promise<UserRecord> {
    try {
      return this.toDomain(
        await this.prisma.user.create({
          data: {
            email: input.email,
            name: input.name,
            passwordHash: input.passwordHash,
            role: roleToPersistence[input.role],
          },
        }),
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new EmailAlreadyRegisteredError(
          "Ya existe una cuenta con este correo.",
        );
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async list(): Promise<UserSummaryRecord[]> {
    return (
      await this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })
    ).map((user) => this.toSummary(user));
  }

  async updateRole(id: string, role: UserRole): Promise<UserSummaryRecord> {
    try {
      return this.toSummary(
        await this.prisma.user.update({
          where: { id },
          data: { role: roleToPersistence[role] },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        }),
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
      ) {
        throw new UserNotFoundError("El usuario no existe.");
      }
      throw error;
    }
  }

  private toSummary(user: {
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    role: "ADMIN" | "CLIENT";
  }): UserSummaryRecord {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: roleToDomain[user.role],
      createdAt: user.createdAt,
    };
  }

  private toDomain(user: {
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    passwordHash: string;
    role: "ADMIN" | "CLIENT";
  }): UserRecord {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: roleToDomain[user.role],
      createdAt: user.createdAt,
    };
  }
}
