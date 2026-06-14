CREATE TABLE "Purchase" (
  "id" UUID NOT NULL,
  "customerId" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "total" DECIMAL(12, 2) NOT NULL,
  "purchasedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "receiptUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteConfiguration" (
  "id" TEXT NOT NULL DEFAULT 'principal',
  "heroTitle" TEXT NOT NULL,
  "heroHighlight" TEXT NOT NULL,
  "heroDescription" TEXT NOT NULL,
  "heroImageUrl" TEXT NOT NULL,
  "servicesEyebrow" TEXT NOT NULL,
  "servicesTitle" TEXT NOT NULL,
  "servicesDescription" TEXT NOT NULL,
  "updatedById" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Purchase_customerId_purchasedAt_idx"
  ON "Purchase"("customerId", "purchasedAt");

ALTER TABLE "Purchase"
  ADD CONSTRAINT "Purchase_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SiteConfiguration"
  ADD CONSTRAINT "SiteConfiguration_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "SiteConfiguration" (
  "id",
  "heroTitle",
  "heroHighlight",
  "heroDescription",
  "heroImageUrl",
  "servicesEyebrow",
  "servicesTitle",
  "servicesDescription",
  "updatedAt"
) VALUES (
  'principal',
  'Cuidado que se nota.',
  'Cariño que se siente.',
  'Baño y limpieza de oídos en un espacio tranquilo, pensado para que tu perro se sienta seguro desde que llega hasta que vuelve contigo.',
  '/images/caninany-hero.webp',
  'Servicios esenciales',
  'Todo lo que necesita para sentirse increíble.',
  'Una rutina simple, bien hecha y adaptada al tamaño de tu mascota.',
  CURRENT_TIMESTAMP
);
