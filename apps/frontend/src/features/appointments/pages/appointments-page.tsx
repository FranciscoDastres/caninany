import type { JSX } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { AppointmentForm } from "../components/appointment-form";

export function AppointmentsPage(): JSX.Element {
  return (
    <section className="bg-brand-soft px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold text-brand-primary"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>
        <div className="grid overflow-hidden bg-white shadow-[0_24px_80px_rgba(116,71,118,0.12)] lg:grid-cols-[0.42fr_1fr]">
          <div className="bg-brand-deep p-7 text-white sm:p-10 lg:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
              Reserva online
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
              Cuéntanos sobre tu mejor amigo.
            </h1>
            <p className="mt-5 leading-7 text-[#ded2e0]">
              Revisa la agenda real, elige un bloque disponible y registra tu
              solicitud. Los horarios pedidos se bloquean automáticamente.
            </p>
          </div>
          <div className="p-6 sm:p-9 lg:p-12">
            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
