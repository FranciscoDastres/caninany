export interface PurchaseDto {
  id: string;
  description: string;
  total: number;
  purchasedAt: string;
  receiptUrl: string | null;
}
