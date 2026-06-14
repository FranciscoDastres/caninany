import type { PurchaseDto } from "@caninany/shared";

import type { PurchaseRepository } from "../../domain/repositories/purchase.repository";

export class PurchasesService {
  constructor(private readonly purchases: PurchaseRepository) {}

  getForCustomer(customerId: string): Promise<PurchaseDto[]> {
    return this.purchases.findByCustomerId(customerId);
  }
}
