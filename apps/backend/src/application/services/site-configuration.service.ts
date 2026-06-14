import type {
  SiteConfigurationDto,
  UpdateSiteConfigurationInput,
} from "@caninany/shared";

import type { SiteConfigurationRepository } from "../../domain/repositories/site-configuration.repository";

const DEFAULT_SITE_CONFIGURATION: SiteConfigurationDto = {
  heroTitle: "Cuidado que se nota.",
  heroHighlight: "Cariño que se siente.",
  heroDescription:
    "Baño y limpieza de oídos en un espacio tranquilo, pensado para que tu perro se sienta seguro desde que llega hasta que vuelve contigo.",
  heroImageUrl: "/images/caninany-hero.webp",
  servicesEyebrow: "Servicios esenciales",
  servicesTitle: "Todo lo que necesita para sentirse increíble.",
  servicesDescription:
    "Una rutina simple, bien hecha y adaptada al tamaño de tu mascota.",
  updatedAt: null,
};

export class SiteConfigurationService {
  constructor(private readonly configuration: SiteConfigurationRepository) {}

  async get(): Promise<SiteConfigurationDto> {
    return (await this.configuration.find()) ?? DEFAULT_SITE_CONFIGURATION;
  }

  update(
    input: UpdateSiteConfigurationInput,
    updatedById: string,
  ): Promise<SiteConfigurationDto> {
    return this.configuration.save(input, updatedById);
  }
}
