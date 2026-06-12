import { z } from "zod";

import { PET_WEIGHT_LIMITS } from "../constants/pet-weight.constants";
import { APPOINTMENT_SERVICES } from "../contracts/appointment.contract";

export const createAppointmentSchema = z.object({
  customerId: z.uuid(),
  petId: z.uuid(),
  petWeightKg: z
    .number()
    .min(PET_WEIGHT_LIMITS.minKg)
    .max(PET_WEIGHT_LIMITS.maxKg),
  service: z.enum(APPOINTMENT_SERVICES),
  startsAt: z.iso.datetime({ offset: true }),
  notes: z.string().trim().max(500).optional(),
});

export const getAvailableSlotsQuerySchema = z.object({
  date: z.iso.date(),
  service: z.enum(APPOINTMENT_SERVICES),
  petWeightKg: z.coerce
    .number()
    .min(PET_WEIGHT_LIMITS.minKg)
    .max(PET_WEIGHT_LIMITS.maxKg),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type GetAvailableSlotsQuery = z.infer<
  typeof getAvailableSlotsQuerySchema
>;
