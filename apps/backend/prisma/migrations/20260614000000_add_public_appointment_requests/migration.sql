ALTER TABLE "Appointment"
  ALTER COLUMN "customerId" DROP NOT NULL,
  ALTER COLUMN "petId" DROP NOT NULL,
  ADD COLUMN "ownerName" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "petName" TEXT,
  ADD COLUMN "petWeightKg" DECIMAL(5, 2);

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_has_requester"
  CHECK (
    (
      "customerId" IS NOT NULL
      AND "petId" IS NOT NULL
    )
    OR
    (
      "ownerName" IS NOT NULL
      AND "phone" IS NOT NULL
      AND "petName" IS NOT NULL
      AND "petWeightKg" IS NOT NULL
    )
  );
