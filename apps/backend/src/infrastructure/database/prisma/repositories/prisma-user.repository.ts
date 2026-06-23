import { Injectable } from "@nestjs/common";
import type { UserRole } from "@caninany/shared";

import {
  EmailAlreadyRegisteredError,
  UserNotFoundError,
} from "../../../../domain/errors/domain.error";
import type {
  CreateUserRecord,
  CreateGoogleUserRecord,
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

const statusToDomain = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
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
            ...(input.emailVerifiedAt === undefined
              ? {}
              : { emailVerifiedAt: input.emailVerifiedAt }),
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

  async createGoogle(input: CreateGoogleUserRecord): Promise<UserRecord> {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({
          data: {
            avatarUrl: input.avatarUrl,
            email: input.email,
            emailVerifiedAt: new Date(),
            name: input.name,
            passwordHash: null,
            role: "CLIENT",
          },
        });
        await transaction.externalIdentity.create({
          data: {
            userId: user.id,
            provider: "GOOGLE",
            providerSubject: input.providerSubject,
            email: input.email,
          },
        });
        return this.toDomain(user);
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new EmailAlreadyRegisteredError(
          "Ya existe una cuenta con este correo o identidad de Google.",
        );
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findByGoogleSubject(subject: string): Promise<UserRecord | null> {
    const identity = await this.prisma.externalIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: "GOOGLE",
          providerSubject: subject,
        },
      },
      include: { user: true },
    });
    return identity ? this.toDomain(identity.user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async hasGoogleIdentity(userId: string): Promise<boolean> {
    return (
      (await this.prisma.externalIdentity.count({
        where: { userId, provider: "GOOGLE" },
      })) === 1
    );
  }

  async linkGoogleIdentity(
    userId: string,
    subject: string,
    email: string,
  ): Promise<void> {
    try {
      await this.prisma.externalIdentity.create({
        data: {
          userId,
          provider: "GOOGLE",
          providerSubject: subject,
          email,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new EmailAlreadyRegisteredError(
          "La identidad de Google ya está vinculada.",
        );
      }
      throw error;
    }
  }

  async list(): Promise<UserSummaryRecord[]> {
    return (
      await this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          avatarUrl: true,
          email: true,
          emailVerifiedAt: true,
          name: true,
          phone: true,
          role: true,
          status: true,
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
            avatarUrl: true,
            email: true,
            emailVerifiedAt: true,
            name: true,
            phone: true,
            role: true,
            status: true,
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

  async unlinkGoogleIdentity(userId: string): Promise<boolean> {
    const result = await this.prisma.externalIdentity.deleteMany({
      where: { userId, provider: "GOOGLE" },
    });
    return result.count === 1;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    );
  }

  private toSummary(user: {
    avatarUrl: string | null;
    createdAt: Date;
    email: string;
    emailVerifiedAt: Date | null;
    id: string;
    name: string;
    phone: string | null;
    role: "ADMIN" | "CLIENT";
    status: "ACTIVE" | "SUSPENDED";
  }): UserSummaryRecord {
    return {
      avatarUrl: user.avatarUrl,
      id: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      name: user.name,
      phone: user.phone,
      role: roleToDomain[user.role],
      status: statusToDomain[user.status],
      createdAt: user.createdAt,
    };
  }

  private toDomain(user: {
    avatarUrl: string | null;
    createdAt: Date;
    email: string;
    emailVerifiedAt: Date | null;
    id: string;
    name: string;
    passwordHash: string | null;
    phone: string | null;
    role: "ADMIN" | "CLIENT";
    status: "ACTIVE" | "SUSPENDED";
  }): UserRecord {
    return {
      avatarUrl: user.avatarUrl,
      id: user.id,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      name: user.name,
      passwordHash: user.passwordHash,
      phone: user.phone,
      role: roleToDomain[user.role],
      status: statusToDomain[user.status],
      createdAt: user.createdAt,
    };
  }
}
