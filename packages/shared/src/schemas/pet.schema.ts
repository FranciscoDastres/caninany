import { z } from "zod";

import { PET_WEIGHT_LIMITS } from "../constants/pet-weight.constants";

const optionalText = (maximumLength: number) =>
  z.string().trim().max(maximumLength).optional();

export const upsertPetSchema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre de tu mascota.").max(80),
  breed: optionalText(120),
  weightKg: z
    .number({ error: "Indica el peso de tu mascota." })
    .min(PET_WEIGHT_LIMITS.minKg, "El peso debe ser mayor a 0,5 kg.")
    .max(PET_WEIGHT_LIMITS.maxKg, "Revisa el peso ingresado."),
  dateOfBirth: z
    .union([z.iso.date("Ingresa una fecha válida."), z.literal("")])
    .optional(),
  medicalNotes: optionalText(1_000),
  behaviorNotes: optionalText(1_000),
});

export const createPetSchema = upsertPetSchema;
export const updatePetSchema = upsertPetSchema;

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
