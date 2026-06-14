import type {
  SiteConfigurationDto,
  UpdateSiteConfigurationInput,
} from "@caninany/shared";
import { describe, expect, it, vi } from "vitest";

import { SiteConfigurationService } from "../../src/application/services/site-configuration.service";
import type { SiteConfigurationRepository } from "../../src/domain/repositories/site-configuration.repository";

const configuration: SiteConfigurationDto = {
  heroTitle: "Cuidado",
  heroHighlight: "Con calma",
  heroDescription: "Descripción",
  heroImageUrl: "/hero.webp",
  servicesEyebrow: "Servicios",
  servicesTitle: "Cuidados",
  servicesDescription: "Descripción de servicios",
  updatedAt: "2026-06-14T12:00:00.000Z",
};

describe("SiteConfigurationService", () => {
  it("coalesces concurrent reads and serves subsequent reads from memory", async () => {
    const repository: SiteConfigurationRepository = {
      find: vi.fn(async () => configuration),
      save: vi.fn(async () => configuration),
    };
    const service = new SiteConfigurationService(repository);

    const results = await Promise.all([
      service.get(),
      service.get(),
      service.get(),
    ]);
    const cachedResult = await service.get();

    expect(results).toEqual([configuration, configuration, configuration]);
    expect(cachedResult).toEqual(configuration);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it("refreshes the cache after an administrative update", async () => {
    const updatedConfiguration = {
      ...configuration,
      heroTitle: "Nuevo título",
      updatedAt: "2026-06-14T13:00:00.000Z",
    };
    const repository: SiteConfigurationRepository = {
      find: vi.fn(async () => configuration),
      save: vi.fn(async () => updatedConfiguration),
    };
    const service = new SiteConfigurationService(repository);
    const input: UpdateSiteConfigurationInput = {
      heroTitle: updatedConfiguration.heroTitle,
      heroHighlight: updatedConfiguration.heroHighlight,
      heroDescription: updatedConfiguration.heroDescription,
      heroImageUrl: updatedConfiguration.heroImageUrl,
      servicesEyebrow: updatedConfiguration.servicesEyebrow,
      servicesTitle: updatedConfiguration.servicesTitle,
      servicesDescription: updatedConfiguration.servicesDescription,
    };

    await service.get();
    await service.update(input, "admin-id");
    const result = await service.get();

    expect(result.heroTitle).toBe("Nuevo título");
    expect(repository.find).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
