import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@caninany/shared";
import { UserPlus } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

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
        <RegisterField label="Nombre" error={errors.name?.message}>
          <Input
            autoComplete="name"
            placeholder="Tu nombre"
            {...register("name")}
          />
        </RegisterField>
        <RegisterField label="Correo" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.cl"
            {...register("email")}
          />
        </RegisterField>
        <RegisterField label="Contraseña" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
          />
        </RegisterField>
        {serverError ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {serverError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-13 items-center justify-center gap-3 rounded-full bg-[#214e3b] px-7 text-sm font-extrabold text-white transition hover:bg-[#183c2d] disabled:opacity-60"
        >
          <UserPlus className="size-4" />
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#6d7b73]">
        ¿Ya tienes una cuenta?{" "}
        <Link className="font-extrabold text-[#214e3b]" to="/ingresar">
          Ingresar
        </Link>
      </p>
    </AuthLayout>
  );
}

interface RegisterFieldProps {
  children: React.ReactNode;
  error?: string | undefined;
  label: string;
}

function RegisterField({
  children,
  error,
  label,
}: RegisterFieldProps): JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#344e41]">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-semibold text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
