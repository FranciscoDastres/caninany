import { Injectable } from "@nestjs/common";

import type {
  AuthSessionRecord,
  AuthSessionRepository,
  CreateAuthSessionRecord,
  RotateRefreshTokenResult,
} from "../../../../domain/repositories/auth-session.repository";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAuthSessionRecord): Promise<AuthSessionRecord> {
    return this.toDomain(
      await this.prisma.authSession.create({
        data: input,
      }),
    );
  }

  async findActiveById(
    id: string,
    now: Date,
  ): Promise<AuthSessionRecord | null> {
    const session = await this.prisma.authSession.findFirst({
      where: { id, revokedAt: null, expiresAt: { gt: now } },
    });
    return session ? this.toDomain(session) : null;
  }

  async isActive(id: string, userId: string, now: Date): Promise<boolean> {
    return (
      (await this.prisma.authSession.count({
        where: {
          id,
          userId,
          revokedAt: null,
          expiresAt: { gt: now },
        },
      })) === 1
    );
  }

  async listActive(userId: string, now: Date): Promise<AuthSessionRecord[]> {
    return (
      await this.prisma.authSession.findMany({
        where: { userId, revokedAt: null, expiresAt: { gt: now } },
        orderBy: { lastUsedAt: "desc" },
      })
    ).map((session) => this.toDomain(session));
  }

  async revokeAll(userId: string, now: Date): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async revokeById(id: string, userId: string, now: Date): Promise<boolean> {
    const result = await this.prisma.authSession.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: now },
    });
    return result.count === 1;
  }

  async revokeWithToken(
    id: string,
    tokenHash: string,
    now: Date,
  ): Promise<boolean> {
    const result = await this.prisma.authSession.updateMany({
      where: {
        id,
        refreshTokenHash: tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });
    return result.count === 1;
  }

  async rotate(
    id: string,
    currentTokenHash: string,
    nextTokenHash: string,
    now: Date,
  ): Promise<RotateRefreshTokenResult> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.authSession.updateMany({
        where: {
          id,
          refreshTokenHash: currentTokenHash,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          refreshTokenHash: nextTokenHash,
          lastUsedAt: now,
        },
      });
      if (result.count === 1) return "rotated";

      const session = await transaction.authSession.findUnique({
        where: { id },
        select: { expiresAt: true, revokedAt: true },
      });
      if (!session || session.revokedAt || session.expiresAt <= now) {
        return "invalid";
      }

      await transaction.authSession.update({
        where: { id },
        data: { revokedAt: now },
      });
      return "reused";
    });
  }

  private toDomain(session: {
    createdAt: Date;
    expiresAt: Date;
    id: string;
    ipAddress: string | null;
    lastUsedAt: Date;
    revokedAt: Date | null;
    userAgent: string | null;
    userId: string;
  }): AuthSessionRecord {
    return session;
  }
}
