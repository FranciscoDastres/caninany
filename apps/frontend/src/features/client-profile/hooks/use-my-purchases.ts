import { useQuery } from "@tanstack/react-query";

import { getMyPurchases } from "../api/purchases.api";

export function useMyPurchases() {
  return useQuery({
    queryKey: ["mis-compras"],
    queryFn: getMyPurchases,
  });
}
