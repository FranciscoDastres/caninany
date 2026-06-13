import type { JSX } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { AppointmentForm } from "../components/appointment-form";

export function AppointmentsPage(): JSX.Element {
  return (
    <section className="min-h-screen bg-[#eef2e8] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#355f4c]"
        >
          <ArrowLeft className="size-4" />
          Volver al inicio
        </Link>
        <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_24px_80px_rgba(35,67,52,0.12)] sm:p-10">
          <p className="eyebrow">Reserva online</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[#183c2d] sm:text-5xl">
            Cuéntanos sobre tu mejor amigo.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[#66766e]">
            Completa la solicitud y te contactaremos para confirmar la hora más
            cómoda para ambos.
          </p>
          <div className="mt-8">
            <AppointmentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
