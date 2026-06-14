export interface SiteConfigurationDto {
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroImageUrl: string;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesDescription: string;
  updatedAt: string | null;
}

export interface UploadedImageDto {
  url: string;
}
