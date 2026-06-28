import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  KeyRound,
  Link2Off,
  LogOut,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { JSX } from "react";

import {
  getSessions,
  logoutAll,
  revokeSession,
  unlinkGoogle,
} from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/store/auth.store";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AccountSecurityPanel(): JSX.Element {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const sessions = useQuery({
    queryFn: getSessions,
    queryKey: ["auth", "sessions"],
  });
  const revokeSessionMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
  });
  const logoutAllMutation = useMutation({
    mutationFn: logoutAll,
    onSuccess: () => clearSession(),
  });
  const unlinkGoogleMutation = useMutation({
    mutationFn: unlinkGoogle,
    onSuccess: async () => {
      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, hasGoogleIdentity: false }
          : state.user,
      }));
      await queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
  });

  const activeSessions = sessions.data ?? [];
  const canUnlinkGoogle = Boolean(user?.hasGoogleIdentity && user.hasPassword);

  return (
    <div className="overflow-hidden border border-[#dfd7e0] bg-white shadow-[0_18px_60px_rgba(116,71,118,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center bg-brand-soft text-brand-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#744776]">
            Cuenta y seguridad
          </h2>
          <p className="text-sm text-[#756e77]">
            Revisa accesos, sesiones activas y metodos de inicio de sesion.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="border border-[#ebe4ec] bg-[#fbf9fb] p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center bg-white text-brand-primary">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h3 className="font-display text-xl text-[#744776]">
                Metodos de acceso
              </h3>
              <p className="text-sm text-[#756e77]">{user?.email}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm text-[#514853]">
            <div className="flex items-center justify-between gap-4 border-b border-[#ebe4ec] pb-3">
              <dt>Contraseña local</dt>
              <dd className="font-bold">
                {user?.hasPassword === false ? "No configurada" : "Activa"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Google</dt>
              <dd className="font-bold">
                {user?.hasGoogleIdentity ? "Vinculado" : "No vinculado"}
              </dd>
            </div>
          </dl>

          {user?.hasGoogleIdentity ? (
            <button
              type="button"
              disabled={!canUnlinkGoogle || unlinkGoogleMutation.isPending}
              onClick={() => unlinkGoogleMutation.mutate()}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-[#d8cdd9] bg-white px-4 py-2 text-sm font-extrabold text-brand-primary transition hover:bg-brand-soft disabled:pointer-events-none disabled:opacity-55"
            >
              <Link2Off className="size-4" />
              {unlinkGoogleMutation.isPending
                ? "Desvinculando..."
                : "Desvincular Google"}
            </button>
          ) : null}

          {user?.hasGoogleIdentity && !user.hasPassword ? (
            <p className="mt-3 text-xs leading-5 text-[#756e77]">
              Agrega una contraseña antes de desvincular Google para no perder
              el acceso a tu cuenta.
            </p>
          ) : null}
          {unlinkGoogleMutation.isError ? (
            <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
              No fue posible desvincular Google.
            </p>
          ) : null}
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl text-[#744776]">
                Sesiones activas
              </h3>
              <p className="text-sm text-[#756e77]">
                Cierra accesos que no reconozcas.
              </p>
            </div>
            <button
              type="button"
              disabled={logoutAllMutation.isPending}
              onClick={() => logoutAllMutation.mutate()}
              className="inline-flex min-h-10 items-center justify-center gap-2 bg-brand-primary px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-deep disabled:pointer-events-none disabled:opacity-60"
            >
              <LogOut className="size-4" />
              {logoutAllMutation.isPending ? "Cerrando..." : "Cerrar todo"}
            </button>
          </div>

          {sessions.isPending ? (
            <p className="mt-6 text-sm text-[#756e77]">Cargando sesiones...</p>
          ) : sessions.isError ? (
            <p className="mt-6 text-sm font-semibold text-red-700" role="alert">
              No fue posible cargar las sesiones.
            </p>
          ) : activeSessions.length === 0 ? (
            <p className="mt-6 text-sm text-[#756e77]">
              No hay sesiones activas para mostrar.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[#ebe4ec] border border-[#ebe4ec]">
              {activeSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center bg-brand-soft text-brand-primary">
                      <Smartphone className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-[#403441]">
                        {session.current ? "Sesion actual" : "Otro acceso"}
                      </p>
                      <p className="mt-1 max-w-xl break-words text-xs leading-5 text-[#756e77]">
                        {session.userAgent ?? "Dispositivo no identificado"}
                      </p>
                      <p className="mt-1 text-xs text-[#756e77]">
                        Ultimo uso:{" "}
                        {dateFormatter.format(new Date(session.lastUsedAt))}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={
                      session.current ||
                      revokeSessionMutation.isPending ||
                      logoutAllMutation.isPending
                    }
                    onClick={() => revokeSessionMutation.mutate(session.id)}
                    className="inline-flex min-h-10 items-center justify-center border border-[#d8cdd9] px-4 py-2 text-sm font-extrabold text-brand-primary transition hover:bg-brand-soft disabled:pointer-events-none disabled:opacity-45"
                  >
                    {session.current ? "Activa" : "Revocar"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {revokeSessionMutation.isError ? (
            <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
              No fue posible revocar la sesion.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
