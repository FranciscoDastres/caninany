import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@caninany/shared";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";

import { resetPassword } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";

export function ResetPasswordPage(): JSX.Element {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      setMessage((await resetPassword(values)).message);
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No fue posible cambiar la contraseña."),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Nueva contraseña"
      title="Define una nueva contraseña."
      description="El enlace solo puede utilizarse una vez."
    >
      {message ? (
        <div className="grid gap-5">
          <p
            role="status"
            className="bg-green-50 px-4 py-4 text-sm font-semibold text-green-800"
          >
            {message}
          </p>
          <Link
            className="h-13 bg-brand-primary px-7 py-4 text-center text-sm font-extrabold text-white"
            to="/ingresar"
          >
            Ir a ingresar
          </Link>
        </div>
      ) : (
        <form className="grid gap-5" onSubmit={onSubmit}>
          <input type="hidden" {...register("token")} />
          <FormField label="Nueva contraseña" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>
          {serverError ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {serverError}
            </p>
          ) : null}
          <button
            disabled={isSubmitting || !token}
            className="h-13 bg-brand-primary px-7 text-sm font-extrabold text-white disabled:opacity-60"
          >
            Cambiar contraseña
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
