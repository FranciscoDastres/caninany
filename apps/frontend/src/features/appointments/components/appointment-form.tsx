import { zodResolver } from "@hookform/resolvers/zod";
import {
  APPOINTMENT_SERVICES,
  createAppointmentSchema,
  type CreateAppointmentInput,
} from "@caninany/shared";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCreateAppointment } from "../hooks/use-create-appointment";

const serviceLabels = {
  bath: "Baño",
  "ear-cleaning": "Limpieza de oídos",
  "bath-and-ear-cleaning": "Baño y limpieza de oídos",
} as const;

export function AppointmentForm(): JSX.Element {
  const mutation = useCreateAppointment();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    reset();
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Field label="ID del cliente" error={errors.customerId?.message}>
        <Input placeholder="UUID del cliente" {...register("customerId")} />
      </Field>

      <Field label="ID de la mascota" error={errors.petId?.message}>
        <Input placeholder="UUID de la mascota" {...register("petId")} />
      </Field>

      <Field label="Peso (kg)" error={errors.petWeightKg?.message}>
        <Input
          type="number"
          step="0.1"
          {...register("petWeightKg", { valueAsNumber: true })}
        />
      </Field>

      <Field label="Servicio" error={errors.service?.message}>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          {...register("service")}
        >
          <option value="">Selecciona un servicio</option>
          {APPOINTMENT_SERVICES.map((service) => (
            <option key={service} value={service}>
              {serviceLabels[service]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Fecha ISO con zona horaria"
        error={errors.startsAt?.message}
      >
        <Input
          placeholder="2026-06-20T12:00:00-04:00"
          {...register("startsAt")}
        />
      </Field>

      <Field label="Notas" error={errors.notes?.message}>
        <textarea
          className="min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...register("notes")}
        />
      </Field>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Agendando..." : "Confirmar hora"}
      </Button>

      {mutation.isSuccess ? (
        <p className="text-sm text-emerald-700">Hora creada correctamente.</p>
      ) : null}
      {mutation.isError ? (
        <p className="text-sm text-red-700">
          No fue posible crear la hora. Revisa tu sesión y disponibilidad.
        </p>
      ) : null}
    </form>
  );
}

interface FieldProps {
  children: React.ReactNode;
  error: string | undefined;
  label: string;
}

function Field({ children, error, label }: FieldProps): JSX.Element {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
      {error ? (
        <span className="text-xs font-normal text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
