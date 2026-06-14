import { z } from "zod";

import { USER_ROLES } from "../contracts/auth.contract";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre."),
  email: z
    .email("Ingresa un correo válido.")
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128),
});

export const loginSchema = z.object({
  email: z
    .email("Ingresa un correo válido.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Ingresa tu contraseña.").max(128),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
