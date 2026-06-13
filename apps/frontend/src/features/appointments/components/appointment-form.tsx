import { zodResolver } from "@hookform/resolvers/zod";
import {
  APPOINTMENT_SERVICES,
  PET_WEIGHT_LIMITS,
  type AppointmentService,
} from "@caninany/shared";
import { Bath, CheckCircle2, Ear, Send, Sparkles } from "lucide-react";
import type { JSX } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";

const bookingRequestSchema = z.object({
  ownerName: z.string().trim().min(2, "Escribe tu nombre."),
  phone: z.string().trim().min(8, "Ingresa un teléfono válido."),
  email: z
    .union([z.email("Ingresa un correo válido."), z.literal("")])
    .optional(),
  petName: z.string().trim().min(2, "Escribe el nombre de tu mascota."),
  petWeightKg: z
    .number({ error: "Indica su peso aproximado." })
    .min(PET_WEIGHT_LIMITS.minKg, "El peso debe ser mayor a 1 kg.")
    .max(PET_WEIGHT_LIMITS.maxKg, "Revisa el peso ingresado."),
  service: z.enum(APPOINTMENT_SERVICES, {
    error: "Selecciona un servicio.",
  }),
  preferredDate: z.string().min(1, "Selecciona una fecha."),
  preferredTime: z.string().min(1, "Selecciona un horario."),
  notes: z.string().trim().max(500, "Máximo 500 caracteres.").optional(),
});

type BookingRequest = z.infer<typeof bookingRequestSchema>;

const serviceOptions: Array<{
  description: string;
  icon: typeof Bath;
  label: string;
  value: AppointmentService;
}> = [
  {
    value: "bath",
    label: "Baño",
    description: "Limpieza, secado y cepillado",
    icon: Bath,
  },
  {
    value: "ear-cleaning",
    label: "Oídos",
    description: "Limpieza externa delicada",
    icon: Ear,
  },
  {
    value: "bath-and-ear-cleaning",
    label: "Completo",
    description: "Baño + limpieza de oídos",
    icon: Sparkles,
  },
];

const availableTimes = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function AppointmentForm(): JSX.Element {
  const [requestReady, setRequestReady] = useState(false);
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<BookingRequest>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      email: "",
      service: "bath-and-ear-cleaning",
      preferredTime: "",
      notes: "",
    },
  });
  const selectedService = watch("service");

  const onSubmit = handleSubmit(async (values) => {
    const service =
      serviceOptions.find((option) => option.value === values.service)?.label ??
      values.service;
    const message = [
      "Hola Caninany, quiero solicitar una hora.",
      `Humano: ${values.ownerName}`,
      `Teléfono: ${values.phone}`,
      `Mascota: ${values.petName}`,
      `Peso aproximado: ${values.petWeightKg} kg`,
      `Servicio: ${service}`,
      `Preferencia: ${values.preferredDate} a las ${values.preferredTime}`,
      values.email ? `Correo: ${values.email}` : "",
      values.notes ? `Notas: ${values.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(
      /\D/g,
      "",
    );

    if (whatsappNumber) {
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (navigator.share) {
      await navigator.share({
        title: "Solicitud de hora Caninany",
        text: message,
      });
    } else {
      await navigator.clipboard.writeText(message);
    }

    setRequestReady(true);
    reset({
      email: "",
      service: "bath-and-ear-cleaning",
      preferredTime: "",
      notes: "",
    });
  });

  if (requestReady) {
    return (
      <div className="grid min-h-[480px] place-items-center text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#dce8db] text-[#2c654b]">
            <CheckCircle2 className="size-9" />
          </span>
          <p className="eyebrow mt-7">Solicitud preparada</p>
          <h3 className="mt-3 font-display text-4xl leading-tight text-[#183c2d]">
            Ya casi tienen su momento Caninany.
          </h3>
          <p className="mt-4 leading-7 text-[#6d7b73]">
            Comparte el resumen por WhatsApp. La hora queda confirmada cuando
            nuestro equipo te responde.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-[#cfc5b8] px-6 text-sm font-extrabold text-[#214e3b] transition hover:bg-white"
            onClick={() => setRequestReady(false)}
          >
            Preparar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-7" onSubmit={onSubmit}>
      <div>
        <p className="eyebrow">Elige su cuidado</p>
        <h3 className="mt-2 font-display text-3xl text-[#183c2d]">
          ¿Qué necesita esta vez?
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {serviceOptions.map((option) => {
            const selected = selectedService === option.value;

            return (
              <label
                key={option.value}
                className={`relative cursor-pointer rounded-[1.4rem] border p-4 transition ${
                  selected
                    ? "border-[#214e3b] bg-[#e8efe8] shadow-sm"
                    : "border-[#dfd7cc] bg-white hover:border-[#9eb1a5]"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="sr-only"
                  {...register("service")}
                />
                <option.icon
                  className={`size-6 ${selected ? "text-[#214e3b]" : "text-[#b16d4b]"}`}
                  strokeWidth={1.8}
                />
                <span className="mt-3 block font-extrabold text-[#2b483a]">
                  {option.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#75827b]">
                  {option.description}
                </span>
                {selected ? (
                  <CheckCircle2 className="absolute right-3 top-3 size-4 text-[#214e3b]" />
                ) : null}
              </label>
            );
          })}
        </div>
        {errors.service ? (
          <p className="mt-2 text-xs font-semibold text-red-700">
            {errors.service.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tu nombre" error={errors.ownerName?.message}>
          <Input
            placeholder="¿Cómo te llamas?"
            autoComplete="name"
            {...register("ownerName")}
          />
        </Field>
        <Field label="WhatsApp" error={errors.phone?.message}>
          <Input
            type="tel"
            placeholder="+56 9 1234 5678"
            autoComplete="tel"
            {...register("phone")}
          />
        </Field>
        <Field label="Nombre de tu mascota" error={errors.petName?.message}>
          <Input placeholder="Ej. Milo" {...register("petName")} />
        </Field>
        <Field label="Peso aproximado (kg)" error={errors.petWeightKg?.message}>
          <Input
            type="number"
            min={PET_WEIGHT_LIMITS.minKg}
            max={PET_WEIGHT_LIMITS.maxKg}
            step="0.1"
            placeholder="Ej. 12"
            {...register("petWeightKg", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Día preferido" error={errors.preferredDate?.message}>
          <Input type="date" min={minDate} {...register("preferredDate")} />
        </Field>
        <Field label="Horario preferido" error={errors.preferredTime?.message}>
          <select className="form-control" {...register("preferredTime")}>
            <option value="">Selecciona una hora</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Correo (opcional)"
        error={errors.email?.message}
        hint="Lo usaremos solo para enviarte la confirmación."
      >
        <Input
          type="email"
          placeholder="tu@correo.cl"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field
        label="¿Hay algo que debamos saber?"
        error={errors.notes?.message}
        hint="Por ejemplo: si se pone nervioso, tiene piel sensible o necesita pausas."
      >
        <textarea
          className="form-control min-h-28 resize-y py-3"
          placeholder="Cuéntanos un poquito sobre su personalidad..."
          {...register("notes")}
        />
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#214e3b] px-8 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(33,78,59,0.2)] transition hover:-translate-y-0.5 hover:bg-[#173c2c] disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? "Preparando..." : "Solicitar una hora"}
        <Send className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-center text-xs leading-5 text-[#7b8780]">
        No se cobra nada ahora. Primero confirmamos disponibilidad contigo.
      </p>
    </form>
  );
}

interface FieldProps {
  children: React.ReactNode;
  error?: string | undefined;
  hint?: string;
  label: string;
}

function Field({ children, error, hint, label }: FieldProps): JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#344e41]">
      <span>{label}</span>
      {children}
      {hint && !error ? (
        <span className="text-xs font-normal leading-5 text-[#849088]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-xs font-semibold text-red-700">{error}</span>
      ) : null}
    </label>
  );
}
