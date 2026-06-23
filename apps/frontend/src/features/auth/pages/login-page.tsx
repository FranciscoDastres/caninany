import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@caninany/shared";
import { LogIn } from "lucide-react";
import type { JSX } from "react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";
import { ApiError } from "@/core/api/http-client";
import { useAuthStore } from "@/store/auth.store";

import { linkGoogle, login, loginWithGoogle } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";
import { GoogleSignInButton } from "../components/google-sign-in-button";

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const completeLogin = useCallback(
    (session: Awaited<ReturnType<typeof login>>): void => {
      setSession(session);
      const requestedPath = (
        location.state as { from?: string } | null | undefined
      )?.from;
      navigate(
        requestedPath ?? (session.user.role === "admin" ? "/admin" : "/perfil"),
        { replace: true },
      );
    },
    [location.state, navigate, setSession],
  );

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const session = await login(values);
      completeLogin(session);
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "No fue posible iniciar sesión."),
      );
    }
  });

  const handleGoogleCredential = useCallback(
    async (credential: string): Promise<void> => {
      setServerError(null);
      try {
        completeLogin(await loginWithGoogle({ credential }));
      } catch (error) {
        if (
          error instanceof ApiError &&
          typeof error.data === "object" &&
          error.data !== null &&
          "code" in error.data &&
          error.data.code === "GOOGLE_LINK_REQUIRED"
        ) {
          const password = getValues("password");
          if (!password) {
            setServerError(
              "Esta cuenta ya existe. Ingresa su contraseña y vuelve a usar Google para vincularla.",
            );
            return;
          }
          try {
            completeLogin(await linkGoogle({ credential, password }));
            return;
          } catch (linkError) {
            setServerError(
              getApiErrorMessage(
                linkError,
                "No fue posible vincular la cuenta de Google.",
              ),
            );
            return;
          }
        }
        setServerError(
          getApiErrorMessage(error, "No fue posible ingresar con Google."),
        );
      }
    },
    [completeLogin, getValues],
  );

  return (
    <AuthLayout
      eyebrow="Acceso"
      title="Qué bueno verte de nuevo."
      description="Ingresa para revisar tus compras y comprobantes."
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
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
            autoComplete="current-password"
            placeholder="Tu contraseña"
            {...register("password")}
          />
        </FormField>
        <Link
          className="-mt-2 text-right text-sm font-bold text-brand-primary"
          to="/recuperar-contrasena"
        >
          ¿Olvidaste tu contraseña?
        </Link>
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
          <LogIn className="size-4" />
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
        <div className="mt-6 grid gap-4">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8b838d]">
            <span className="h-px flex-1 bg-[#ddd7df]" />o
            <span className="h-px flex-1 bg-[#ddd7df]" />
          </div>
          <GoogleSignInButton onCredential={handleGoogleCredential} />
        </div>
      ) : null}
      <p className="mt-6 text-center text-sm text-[#756e77]">
        ¿Aún no tienes cuenta?{" "}
        <Link className="font-extrabold text-[#8f6291]" to="/registro">
          Crear cuenta
        </Link>
      </p>
    </AuthLayout>
  );
}
