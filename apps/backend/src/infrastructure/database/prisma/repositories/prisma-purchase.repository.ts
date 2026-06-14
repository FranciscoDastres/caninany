import { Injectable } from "@nestjs/common";
import type { PurchaseDto } from "@caninany/shared";

import type { PurchaseRepository } from "../../../../domain/repositories/purchase.repository";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaPurchaseRepository implements PurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCustomerId(customerId: string): Promise<PurchaseDto[]> {
    return (
      await this.prisma.purchase.findMany({
        where: { customerId },
        orderBy: { purchasedAt: "desc" },
        select: {
          id: true,
          description: true,
          total: true,
          purchasedAt: true,
          receiptUrl: true,
        },
      })
    ).map((purchase) => ({
      id: purchase.id,
      description: purchase.description,
      total: Number(purchase.total),
      purchasedAt: purchase.purchasedAt.toISOString(),
      receiptUrl: purchase.receiptUrl,
    }));
  }
}
