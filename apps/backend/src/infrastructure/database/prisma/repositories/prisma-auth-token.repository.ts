import { Injectable } from "@nestjs/common";

import type {
  AuthTokenKind,
  AuthTokenRepository,
} from "../../../../domain/repositories/auth-token.repository";
import { PrismaService } from "../prisma.service";

const typeToPersistence = {
  "email-verification": "EMAIL_VERIFICATION",
  "password-reset": "PASSWORD_RESET",
} as const;

@Injectable()
export class PrismaAuthTokenRepository implements AuthTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replace(
    userId: string,
    type: AuthTokenKind,
    tokenHash: string,
    expiresAt: Date,
    now: Date,
  ): Promise<void> {
    const persistenceType = typeToPersistence[type];
    await this.prisma.$transaction([
      this.prisma.authToken.updateMany({
        where: { userId, type: persistenceType, usedAt: null },
        data: { usedAt: now },
      }),
      this.prisma.authToken.create({
        data: { userId, type: persistenceType, tokenHash, expiresAt },
      }),
    ]);
  }

  async verifyEmail(tokenHash: string, now: Date): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.authToken.findFirst({
        where: {
          tokenHash,
          type: "EMAIL_VERIFICATION",
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true, userId: true },
      });
      if (!token) return false;

      const consumed = await transaction.authToken.updateMany({
        where: { id: token.id, usedAt: null },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: token.userId },
        data: { emailVerifiedAt: now },
      });
      return true;
    });
  }

  async resetPassword(
    tokenHash: string,
    passwordHash: string,
    now: Date,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const token = await transaction.authToken.findFirst({
        where: {
          tokenHash,
          type: "PASSWORD_RESET",
          usedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true, userId: true },
      });
      if (!token) return false;

      const consumed = await transaction.authToken.updateMany({
        where: { id: token.id, usedAt: null },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      });
      await transaction.authSession.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: now },
      });
      return true;
    });
  }
}
