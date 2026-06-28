import { z } from "zod";

import { PET_WEIGHT_LIMITS } from "../constants/pet-weight.constants";
import {
  APPOINTMENT_SERVICES,
  APPOINTMENT_STATUSES,
} from "../contracts/appointment.contract";

export const createAppointmentSchema = z.object({
  customerId: z.uuid().optional(),
  petId: z.uuid(),
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

export const getAppointmentCalendarQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El mes debe usar el formato AAAA-MM."),
  service: z.enum(APPOINTMENT_SERVICES),
  petWeightKg: z.coerce
    .number()
    .min(PET_WEIGHT_LIMITS.minKg)
    .max(PET_WEIGHT_LIMITS.maxKg),
});

export const createPublicAppointmentRequestSchema = z.object({
  ownerName: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un teléfono válido.")
    .max(30)
    .regex(/^[+()\d\s-]+$/, "Ingresa un teléfono válido."),
  email: z
    .union([z.email("Ingresa un correo válido."), z.literal("")])
    .optional(),
  petName: z.string().trim().min(2, "Escribe el nombre de tu mascota.").max(80),
  petWeightKg: z
    .number({ error: "Indica su peso aproximado." })
    .min(PET_WEIGHT_LIMITS.minKg, "El peso debe ser mayor a 0,5 kg.")
    .max(PET_WEIGHT_LIMITS.maxKg, "Revisa el peso ingresado."),
  service: z.enum(APPOINTMENT_SERVICES, {
    error: "Selecciona un servicio.",
  }),
  startsAt: z.iso.datetime({
    offset: true,
    error: "Selecciona un día y una hora disponible.",
  }),
  notes: z.string().trim().max(500, "Máximo 500 caracteres.").optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES, {
    error: "Selecciona un estado valido.",
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type GetAvailableSlotsQuery = z.infer<
  typeof getAvailableSlotsQuerySchema
>;
export type GetAppointmentCalendarQuery = z.infer<
  typeof getAppointmentCalendarQuerySchema
>;
export type CreatePublicAppointmentRequestInput = z.infer<
  typeof createPublicAppointmentRequestSchema
>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;
