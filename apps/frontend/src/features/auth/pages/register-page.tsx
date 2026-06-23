import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@caninany/shared";
import { UserPlus } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";
import { useAuthStore } from "@/store/auth.store";

import { register as registerAccount } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const session = await registerAccount(values);
      setSession(session);
      navigate("/perfil", { replace: true });
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No fue posible crear la cuenta."),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Nueva cuenta"
      title="Crea tu espacio personal."
      description="Regístrate como cliente para mantener tus compras y comprobantes ordenados."
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
        <FormField label="Nombre" error={errors.name?.message}>
          <Input
            autoComplete="name"
            placeholder="Tu nombre"
            {...register("name")}
          />
        </FormField>
        <FormField label="Correo" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.cl"
            {...register("email")}
          />
        </FormField>
        <FormField label="Contraseña" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
          />
        </FormField>
        {serverError ? (
          <p
            role="alert"
            className="bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            {serverError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-13 items-center justify-center gap-3 bg-brand-primary px-7 text-sm font-extrabold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          <UserPlus className="size-4" />
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#756e77]">
        ¿Ya tienes una cuenta?{" "}
        <Link className="font-extrabold text-[#8f6291]" to="/ingresar">
          Ingresar
        </Link>
      </p>
    </AuthLayout>
  );
}
