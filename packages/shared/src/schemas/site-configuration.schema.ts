import { z } from "zod";

export const updateSiteConfigurationSchema = z.object({
  heroTitle: z.string().trim().min(3).max(120),
  heroHighlight: z.string().trim().min(3).max(120),
  heroDescription: z.string().trim().min(10).max(500),
  heroImageUrl: z.string().trim().min(1).max(500),
  servicesEyebrow: z.string().trim().min(3).max(80),
  servicesTitle: z.string().trim().min(3).max(160),
  servicesDescription: z.string().trim().min(10).max(500),
});

export type UpdateSiteConfigurationInput = z.infer<
  typeof updateSiteConfigurationSchema
>;
