import type { JSX } from "react";

import { Card } from "@/components/ui/card";

import { AppointmentForm } from "../components/appointment-form";

export function AppointmentsPage(): JSX.Element {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_460px]">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Atención para mascotas
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950">
          Agenda baño y limpieza de oídos sin llamadas ni esperas.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-slate-600">
          La duración se calcula según el servicio y el peso de la mascota. Los
          horarios ocupados se bloquean automáticamente.
        </p>
      </div>
      <Card>
        <h2 className="mb-5 text-xl font-semibold">Nueva reserva</h2>
        <AppointmentForm />
      </Card>
    </section>
  );
}
