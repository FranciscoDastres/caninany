import { zodResolver } from "@hookform/resolvers/zod";
import { emailActionSchema, type EmailActionInput } from "@caninany/shared";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";

import { forgotPassword } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";

export function ForgotPasswordPage(): JSX.Element {
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailActionInput>({ resolver: zodResolver(emailActionSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      setMessage((await forgotPassword(values)).message);
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No fue posible procesar la solicitud."),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Recuperación"
      title="Recupera tu acceso."
      description="Te enviaremos un enlace válido por 30 minutos."
    >
      {message ? (
        <p
          role="status"
          className="bg-green-50 px-4 py-4 text-sm font-semibold text-green-800"
        >
          {message}
        </p>
      ) : (
        <form className="grid gap-5" onSubmit={onSubmit}>
          <FormField label="Correo" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </FormField>
          {serverError ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {serverError}
            </p>
          ) : null}
          <button
            disabled={isSubmitting}
            className="h-13 bg-brand-primary px-7 text-sm font-extrabold text-white"
          >
            Enviar enlace
          </button>
        </form>
      )}
      <Link
        className="mt-6 block text-center text-sm font-bold text-brand-primary"
        to="/ingresar"
      >
        Volver a ingresar
      </Link>
    </AuthLayout>
  );
}
