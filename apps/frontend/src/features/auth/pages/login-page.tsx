import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@caninany/shared";
import { LogIn } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";
import { useAuthStore } from "@/store/auth.store";

import { login } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const session = await login(values);
      setSession(session);
      const requestedPath = (
        location.state as { from?: string } | null | undefined
      )?.from;
      navigate(
        requestedPath ?? (session.user.role === "admin" ? "/admin" : "/perfil"),
        { replace: true },
      );
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No fue posible iniciar sesión."),
      );
    }
  });

  return (
    <AuthLayout
      eyebrow="Acceso"
      title="Qué bueno verte de nuevo."
      description="Ingresa para revisar tus compras y comprobantes."
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
        <AuthField label="Correo" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="tu@correo.cl"
            {...register("email")}
          />
        </AuthField>
        <AuthField label="Contraseña" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            {...register("password")}
          />
        </AuthField>
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
          <LogIn className="size-4" />
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#6d7b73]">
        ¿Aún no tienes cuenta?{" "}
        <Link className="font-extrabold text-[#214e3b]" to="/registro">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}

interface AuthFieldProps {
  children: React.ReactNode;
  error?: string | undefined;
  label: string;
}

function AuthField({ children, error, label }: AuthFieldProps): JSX.Element {
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
