CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE "AppointmentService" AS ENUM (
  'BATH',
  'EAR_CLEANING',
  'BATH_AND_EAR_CLEANING'
);
CREATE TYPE "AppointmentStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pet" (
  "id" UUID NOT NULL,
  "ownerId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "breed" TEXT,
  "weightKg" DECIMAL(5, 2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Appointment" (
  "id" UUID NOT NULL,
  "customerId" UUID NOT NULL,
  "petId" UUID NOT NULL,
  "service" "AppointmentService" NOT NULL,
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "endsAt" TIMESTAMPTZ(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Pet_ownerId_idx" ON "Pet"("ownerId");
CREATE INDEX "Appointment_customerId_startsAt_idx"
  ON "Appointment"("customerId", "startsAt");
CREATE INDEX "Appointment_petId_startsAt_idx"
  ON "Appointment"("petId", "startsAt");
CREATE INDEX "Appointment_startsAt_endsAt_idx"
  ON "Appointment"("startsAt", "endsAt");

ALTER TABLE "Pet"
  ADD CONSTRAINT "Pet_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_no_overlapping_active_slots"
  EXCLUDE USING GIST (
    tstzrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING', 'CONFIRMED'));
