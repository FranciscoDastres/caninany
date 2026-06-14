ALTER TABLE "Appointment"
  DROP CONSTRAINT "Appointment_has_requester";

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_has_requester"
  CHECK (
    (
      "customerId" IS NOT NULL
      AND "petId" IS NOT NULL
      AND "ownerName" IS NULL
      AND "phone" IS NULL
      AND "email" IS NULL
      AND "petName" IS NULL
      AND "petWeightKg" IS NULL
    )
    OR
    (
      "customerId" IS NULL
      AND "petId" IS NULL
      AND "ownerName" IS NOT NULL
      AND "phone" IS NOT NULL
      AND "petName" IS NOT NULL
      AND "petWeightKg" IS NOT NULL
    )
  );
