import { Injectable } from "@nestjs/common";
import type {
  SiteConfigurationDto,
  UpdateSiteConfigurationInput,
} from "@caninany/shared";

import type { SiteConfigurationRepository } from "../../../../domain/repositories/site-configuration.repository";
import { PrismaService } from "../prisma.service";

const CONFIGURATION_ID = "principal";

@Injectable()
export class PrismaSiteConfigurationRepository implements SiteConfigurationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<SiteConfigurationDto | null> {
    const configuration = await this.prisma.siteConfiguration.findUnique({
      where: { id: CONFIGURATION_ID },
      select: {
        heroTitle: true,
        heroHighlight: true,
        heroDescription: true,
        heroImageUrl: true,
        servicesEyebrow: true,
        servicesTitle: true,
        servicesDescription: true,
        updatedAt: true,
      },
    });
    return configuration ? this.toDto(configuration) : null;
  }

  async save(
    input: UpdateSiteConfigurationInput,
    updatedById: string,
  ): Promise<SiteConfigurationDto> {
    return this.toDto(
      await this.prisma.siteConfiguration.upsert({
        where: { id: CONFIGURATION_ID },
        create: {
          id: CONFIGURATION_ID,
          ...input,
          updatedById,
        },
        update: {
          ...input,
          updatedById,
        },
      }),
    );
  }

  private toDto(configuration: {
    heroDescription: string;
    heroHighlight: string;
    heroImageUrl: string;
    heroTitle: string;
    servicesDescription: string;
    servicesEyebrow: string;
    servicesTitle: string;
    updatedAt: Date;
  }): SiteConfigurationDto {
    return {
      heroTitle: configuration.heroTitle,
      heroHighlight: configuration.heroHighlight,
      heroDescription: configuration.heroDescription,
      heroImageUrl: configuration.heroImageUrl,
      servicesEyebrow: configuration.servicesEyebrow,
      servicesTitle: configuration.servicesTitle,
      servicesDescription: configuration.servicesDescription,
      updatedAt: configuration.updatedAt.toISOString(),
    };
  }
}
