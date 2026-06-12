import { useQuery } from "@tanstack/react-query";

import { getPets } from "../api/pets.api";

export function usePets() {
  return useQuery({
    queryKey: ["pets"],
    queryFn: getPets,
  });
}
