import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "@/core/api/get-api-error";

import { verifyEmail } from "../api/auth.api";
import { AuthLayout } from "../components/auth-layout";

export function VerifyEmailPage(): JSX.Element {
  const [params] = useSearchParams();
  const token = params.get("token");
  const started = useRef(false);
  const [message, setMessage] = useState("Verificando tu correo...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setFailed(true);
      setMessage("El enlace de verificación no es válido.");
      return;
    }
    void verifyEmail({ token })
      .then((result) => setMessage(result.message))
      .catch((error: unknown) => {
        setFailed(true);
        setMessage(
          getApiErrorMessage(error, "No fue posible verificar el correo."),
        );
      });
  }, [token]);

  return (
    <AuthLayout
      eyebrow="Verificación"
      title={failed ? "No pudimos verificar el correo." : "Verifica tu cuenta."}
      description={message}
    >
      <Link
        to={failed ? "/registro" : "/ingresar"}
        className="inline-flex h-13 w-full items-center justify-center bg-brand-primary px-7 text-sm font-extrabold text-white"
      >
        {failed ? "Volver al registro" : "Ir a ingresar"}
      </Link>
    </AuthLayout>
  );
}
