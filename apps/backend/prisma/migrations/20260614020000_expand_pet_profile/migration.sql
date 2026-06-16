ALTER TABLE "Pet"
  ADD COLUMN "dateOfBirth" DATE,
  ADD COLUMN "medicalNotes" TEXT,
  ADD COLUMN "behaviorNotes" TEXT,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

DROP INDEX "Pet_ownerId_idx";

CREATE INDEX "Pet_ownerId_archivedAt_idx"
  ON "Pet"("ownerId", "archivedAt");
