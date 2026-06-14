import type { PurchaseDto } from "@caninany/shared";

export const PURCHASE_REPOSITORY = Symbol("PURCHASE_REPOSITORY");

export interface PurchaseRepository {
  findByCustomerId(customerId: string): Promise<PurchaseDto[]>;
}
