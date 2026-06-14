import type { SiteConfigurationDto } from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function getSiteConfiguration(): Promise<SiteConfigurationDto> {
  const response = await httpClient.get<SiteConfigurationDto>(
    "/configuracion-sitio",
  );
  return response.data;
}
