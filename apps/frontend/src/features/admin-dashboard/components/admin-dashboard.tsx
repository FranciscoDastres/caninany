import type { JSX } from "react";

import { Card } from "@/components/ui/card";

export function AdminDashboard(): JSX.Element {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-700">Administración</p>
        <h1 className="text-3xl font-bold">Agenda del día</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>Reservas pendientes</Card>
        <Card>Servicios confirmados</Card>
        <Card>Capacidad disponible</Card>
      </div>
    </section>
  );
}
