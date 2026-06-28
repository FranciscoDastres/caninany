import type { AppointmentDto, AppointmentService } from "@caninany/shared";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, History } from "lucide-react";
import type { JSX } from "react";

import { getMyAppointments } from "@/features/appointments/api/appointments.api";

const serviceLabels: Record<AppointmentService, string> = {
  bath: "Baño",
  "bath-and-ear-cleaning": "Baño + oídos",
  "ear-cleaning": "Limpieza de oídos",
};

const statusLabels: Record<AppointmentDto["status"], string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  confirmed: "Confirmada",
  pending: "Pendiente",
};

const statusClasses: Record<AppointmentDto["status"], string> = {
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function ClientAppointmentsPanel(): JSX.Element {
  const appointments = useQuery({
    queryFn: getMyAppointments,
    queryKey: ["appointments", "my"],
  });

  const now = Date.now();
  const allAppointments = appointments.data ?? [];
  const upcomingAppointments = allAppointments
    .filter(
      (appointment) =>
        appointment.status !== "cancelled" &&
        appointment.status !== "completed" &&
        new Date(appointment.startsAt).getTime() >= now,
    )
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  const pastAppointments = allAppointments
    .filter((appointment) => !upcomingAppointments.includes(appointment))
    .slice(0, 6);

  return (
    <div className="overflow-hidden border border-[#dfd7e0] bg-white shadow-[0_18px_60px_rgba(116,71,118,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center bg-brand-soft text-brand-primary">
          <CalendarDays className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#744776]">Mis citas</h2>
          <p className="text-sm text-[#756e77]">
            Revisa tus próximas reservas y el historial de visitas.
          </p>
        </div>
      </div>

      {appointments.isPending ? (
        <p className="px-8 py-12 text-center text-[#756e77]">
          Cargando tus citas...
        </p>
      ) : appointments.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar tus citas.
        </p>
      ) : (
        <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-2">
          <AppointmentList
            emptyText="No tienes citas próximas."
            icon={<Clock3 className="size-5" />}
            title="Próximas"
            appointments={upcomingAppointments}
          />
          <AppointmentList
            emptyText="Aún no hay historial de citas."
            icon={<History className="size-5" />}
            title="Historial"
            appointments={pastAppointments}
          />
        </div>
      )}
    </div>
  );
}

interface AppointmentListProps {
  appointments: AppointmentDto[];
  emptyText: string;
  icon: JSX.Element;
  title: string;
}

function AppointmentList({
  appointments,
  emptyText,
  icon,
  title,
}: AppointmentListProps): JSX.Element {
  return (
    <section>
      <div className="flex items-center gap-2">
        <span className="text-brand-primary">{icon}</span>
        <h3 className="font-display text-xl text-[#744776]">{title}</h3>
      </div>

      {appointments.length === 0 ? (
        <div className="mt-4 border border-dashed border-[#d8cdd9] bg-[#fbf9fb] px-5 py-8 text-center text-sm text-[#756e77]">
          {emptyText}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="border border-[#ebe4ec] bg-[#fbf9fb] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-[#403441]">
                    {appointment.petName ?? "Mascota"}
                  </p>
                  <p className="mt-1 text-sm text-[#756e77]">
                    {serviceLabels[appointment.service]}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-extrabold ${statusClasses[appointment.status]}`}
                >
                  {statusLabels[appointment.status]}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-[#514853] sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#8a7f8b]">
                    Fecha
                  </dt>
                  <dd className="mt-1">
                    {dateFormatter.format(new Date(appointment.startsAt))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#8a7f8b]">
                    Duración
                  </dt>
                  <dd className="mt-1">{appointment.durationMinutes} min</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
