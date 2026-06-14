import type { PurchaseDto } from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function getMyPurchases(): Promise<PurchaseDto[]> {
  const response = await httpClient.get<PurchaseDto[]>("/compras/mis-compras");
  return response.data;
}
