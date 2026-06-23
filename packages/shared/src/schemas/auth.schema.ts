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

export const emailActionSchema = z.object({
  email: z
    .email("Ingresa un correo válido.")
    .transform((value) => value.toLowerCase()),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32, "El enlace de verificación no es válido.").max(512),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, "El enlace de recuperación no es válido.").max(512),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128),
});

export const googleCredentialSchema = z.object({
  credential: z.string().min(100, "La credencial de Google no es válida."),
});

export const googleLinkSchema = googleCredentialSchema.extend({
  password: z.string().min(1, "Ingresa tu contraseña actual.").max(128),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailActionInput = z.infer<typeof emailActionSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleCredentialInput = z.infer<typeof googleCredentialSchema>;
export type GoogleLinkInput = z.infer<typeof googleLinkSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
