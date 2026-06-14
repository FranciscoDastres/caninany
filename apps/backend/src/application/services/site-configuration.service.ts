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
const CONFIGURATION_CACHE_TTL_MS = 60_000;

export class SiteConfigurationService {
  private cache: { expiresAt: number; value: SiteConfigurationDto } | null =
    null;
  private pendingLoad: Promise<SiteConfigurationDto> | null = null;

  constructor(private readonly configuration: SiteConfigurationRepository) {}

  async get(): Promise<SiteConfigurationDto> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.value;
    }
    if (this.pendingLoad) return this.pendingLoad;

    this.pendingLoad = this.load();
    try {
      return await this.pendingLoad;
    } finally {
      this.pendingLoad = null;
    }
  }

  async update(
    input: UpdateSiteConfigurationInput,
    updatedById: string,
  ): Promise<SiteConfigurationDto> {
    const value = await this.configuration.save(input, updatedById);
    this.setCache(value);
    return value;
  }

  private async load(): Promise<SiteConfigurationDto> {
    const value =
      (await this.configuration.find()) ?? DEFAULT_SITE_CONFIGURATION;
    this.setCache(value);
    return value;
  }

  private setCache(value: SiteConfigurationDto): void {
    this.cache = {
      value,
      expiresAt: Date.now() + CONFIGURATION_CACHE_TTL_MS,
    };
  }
}
