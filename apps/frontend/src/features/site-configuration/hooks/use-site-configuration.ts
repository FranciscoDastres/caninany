import { useQuery } from "@tanstack/react-query";

import { getSiteConfiguration } from "../api/site-configuration.api";

export function useSiteConfiguration() {
  return useQuery({
    queryKey: ["configuracion-sitio"],
    queryFn: getSiteConfiguration,
    staleTime: 60_000,
  });
}
