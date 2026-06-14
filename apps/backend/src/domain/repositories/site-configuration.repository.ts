import type {
  SiteConfigurationDto,
  UpdateSiteConfigurationInput,
} from "@caninany/shared";

export const SITE_CONFIGURATION_REPOSITORY = Symbol(
  "SITE_CONFIGURATION_REPOSITORY",
);

export interface SiteConfigurationRepository {
  find(): Promise<SiteConfigurationDto | null>;
  save(
    input: UpdateSiteConfigurationInput,
    updatedById: string,
  ): Promise<SiteConfigurationDto>;
}
