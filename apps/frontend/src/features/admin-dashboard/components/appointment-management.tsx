import type { AdminAppointmentDto, AppointmentStatus } from "@caninany/shared";
import { APPOINTMENT_STATUSES } from "@caninany/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, CircleDashed } from "lucide-react";
import type { JSX } from "react";
import { useMemo, useState } from "react";

import { getApiErrorMessage } from "@/core/api/get-api-error";

import {
  getAdminAppointments,
  updateAppointmentStatus,
} from "../api/admin.api";

const serviceLabels: Record<AdminAppointmentDto["service"], string> = {
  bath: "Baño",
  "bath-and-ear-cleaning": "Baño + oídos",
  "ear-cleaning": "Limpieza de oídos",
};

const statusLabels: Record<AppointmentStatus, string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  confirmed: "Confirmada",
  pending: "Pendiente",
};

const statusClasses: Record<AppointmentStatus, string> = {
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
  confirmed: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AppointmentManagement(): JSX.Element {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const appointments = useQuery({
    queryFn: getAdminAppointments,
    queryKey: ["admin", "appointments"],
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: (updatedAppointment) => {
      queryClient.setQueryData<AdminAppointmentDto[]>(
        ["admin", "appointments"],
        (current) =>
          current?.map((appointment) =>
            appointment.id === updatedAppointment.id
              ? updatedAppointment
              : appointment,
          ) ?? [updatedAppointment],
      );
      setMessage("Estado de cita actualizado.");
    },
    onError: (error) =>
      setMessage(
        getApiErrorMessage(error, "No fue posible actualizar la cita."),
      ),
  });
  const summary = useMemo(() => {
    const initial: Record<AppointmentStatus, number> = {
      cancelled: 0,
      completed: 0,
      confirmed: 0,
      pending: 0,
    };

    for (const appointment of appointments.data ?? []) {
      initial[appointment.status] += 1;
    }

    return initial;
  }, [appointments.data]);

  return (
    <article className="overflow-hidden border border-[#dfd7e0] bg-white shadow-[0_18px_60px_rgba(116,71,118,0.08)]">
      <div className="flex items-center gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:px-8">
        <span className="grid size-11 place-items-center bg-brand-soft text-brand-primary">
          <CalendarCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl text-[#744776]">
            Gestión de citas
          </h2>
          <p className="text-sm text-[#756e77]">
            Revisa solicitudes, confirma reservas y cierra atenciones.
          </p>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className="mx-6 mt-5 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-primary sm:mx-8"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 border-b border-[#ebe4ec] px-6 py-5 sm:grid-cols-4 sm:px-8">
        {APPOINTMENT_STATUSES.map((status) => (
          <div key={status} className="bg-[#fbf9fb] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#756e77]">
              {statusLabels[status]}
            </p>
            <p className="mt-1 font-display text-3xl text-[#744776]">
              {summary[status]}
            </p>
          </div>
        ))}
      </div>

      {appointments.isPending ? (
        <p className="px-8 py-12 text-center text-[#756e77]">
          Cargando citas...
        </p>
      ) : appointments.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar las citas.
        </p>
      ) : appointments.data.length === 0 ? (
        <div className="px-8 py-12 text-center text-[#756e77]">
          <CircleDashed className="mx-auto size-8 text-brand-primary" />
          <p className="mt-3">Aún no hay citas registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-[#f7f5f7] text-xs uppercase tracking-[0.12em] text-[#756e77]">
              <tr>
                <th className="px-8 py-4">Cita</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Horario</th>
                <th className="px-6 py-4">Notas</th>
                <th className="px-8 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e3ea]">
              {appointments.data.map((appointment) => (
                <AppointmentRow
                  appointment={appointment}
                  isUpdating={
                    statusMutation.isPending &&
                    statusMutation.variables?.id === appointment.id
                  }
                  key={appointment.id}
                  onStatusChange={(status) =>
                    statusMutation.mutate({ id: appointment.id, status })
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

interface AppointmentRowProps {
  appointment: AdminAppointmentDto;
  isUpdating: boolean;
  onStatusChange: (status: AppointmentStatus) => void;
}

function AppointmentRow({
  appointment,
  isUpdating,
  onStatusChange,
}: AppointmentRowProps): JSX.Element {
  const ownerName =
    appointment.customerName ?? appointment.ownerName ?? "Sin nombre";
  const ownerEmail = appointment.customerEmail ?? appointment.ownerEmail;
  const ownerPhone = appointment.customerPhone ?? appointment.ownerPhone;
  const petWeight = appointment.petWeightKg
    ? `${appointment.petWeightKg} kg`
    : null;

  return (
    <tr className="align-top text-sm text-[#514853]">
      <td className="px-8 py-5">
        <p className="font-bold text-[#403441]">
          {appointment.petName ?? "Mascota"}
        </p>
        <p className="mt-1 text-[#756e77]">
          {serviceLabels[appointment.service]}
        </p>
        {petWeight ? (
          <p className="mt-1 text-xs text-[#756e77]">{petWeight}</p>
        ) : null}
      </td>
      <td className="px-6 py-5">
        <p className="font-bold text-[#403441]">{ownerName}</p>
        {ownerEmail ? (
          <p className="mt-1 text-[#756e77]">{ownerEmail}</p>
        ) : null}
        {ownerPhone ? (
          <p className="mt-1 text-[#756e77]">{ownerPhone}</p>
        ) : null}
      </td>
      <td className="px-6 py-5">
        <p>{dateFormatter.format(new Date(appointment.startsAt))}</p>
        <p className="mt-1 text-[#756e77]">{appointment.durationMinutes} min</p>
      </td>
      <td className="max-w-[220px] px-6 py-5 text-[#756e77]">
        {appointment.notes ?? "Sin notas"}
      </td>
      <td className="px-8 py-5 text-right">
        <span
          className={`mb-3 inline-flex px-3 py-1 text-xs font-extrabold ${statusClasses[appointment.status]}`}
        >
          {statusLabels[appointment.status]}
        </span>
        <select
          aria-label={`Estado de cita de ${ownerName}`}
          className="form-control ml-auto max-w-44"
          disabled={isUpdating}
          value={appointment.status}
          onChange={(event) =>
            onStatusChange(event.target.value as AppointmentStatus)
          }
        >
          {APPOINTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
