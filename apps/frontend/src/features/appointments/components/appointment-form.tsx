import { zodResolver } from "@hookform/resolvers/zod";
import {
  PET_WEIGHT_LIMITS,
  createPublicAppointmentRequestSchema,
  type AppointmentService,
  type CreatePublicAppointmentRequestInput,
  type PublicAppointmentRequestDto,
} from "@caninany/shared";
import { Bath, CheckCircle2, Ear, Send, Sparkles } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";

import { useCreatePublicAppointmentRequest } from "../hooks/use-create-public-appointment-request";
import { AppointmentCalendar } from "./appointment-calendar";

const serviceOptions: Array<{
  badge?: string;
  description: string;
  icon: typeof Bath;
  label: string;
  value: AppointmentService;
}> = [
  {
    value: "bath",
    label: "Baño",
    description: "Limpieza, secado y cepillado.",
    icon: Bath,
  },
  {
    value: "ear-cleaning",
    label: "Oídos",
    description: "Limpieza externa delicada.",
    icon: Ear,
  },
  {
    value: "bath-and-ear-cleaning",
    label: "Baño + oídos",
    description: "La visita completa en un solo bloque.",
    icon: Sparkles,
    badge: "Recomendado",
  },
];

export function AppointmentForm(): JSX.Element {
  const mutation = useCreatePublicAppointmentRequest();
  const [createdRequest, setCreatedRequest] =
    useState<PublicAppointmentRequestDto | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CreatePublicAppointmentRequestInput>({
    resolver: zodResolver(createPublicAppointmentRequestSchema),
    defaultValues: {
      email: "",
      service: "bath-and-ear-cleaning",
      startsAt: "",
      notes: "",
    },
  });
  const selectedService = watch("service");
  const petWeightKg = watch("petWeightKg");
  const selectedStartsAt = watch("startsAt");
  const availabilityKey = `${selectedService}:${petWeightKg}`;
  const previousAvailabilityKey = useRef(availabilityKey);

  useEffect(() => {
    if (previousAvailabilityKey.current === availabilityKey) return;

    previousAvailabilityKey.current = availabilityKey;
    setValue("startsAt", "", { shouldValidate: false });
    setServerError(null);
  }, [availabilityKey, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const request = await mutation.mutateAsync(values);
      setCreatedRequest(request);
      await shareRequestSummary(values, request);
      reset({
        email: "",
        service: "bath-and-ear-cleaning",
        startsAt: "",
        notes: "",
      });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "No fue posible registrar la solicitud. Intenta nuevamente.",
        ),
      );
    }
  });

  if (createdRequest) {
    return (
      <div className="grid min-h-[480px] place-items-center text-center">
        <div className="max-w-md">
          <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#dce8db] text-[#2c654b]">
            <CheckCircle2 className="size-9" />
          </span>
          <p className="eyebrow mt-7">Solicitud registrada</p>
          <h3 className="mt-3 font-display text-4xl leading-tight text-[#183c2d]">
            El bloque quedó reservado para revisión.
          </h3>
          <p className="mt-4 leading-7 text-[#6d7b73]">
            Guardamos tu solicitud para el{" "}
            <strong>
              {formatRequestDateTime(
                createdRequest.startsAt,
                createdRequest.endsAt,
              )}
            </strong>
            . Te contactaremos para confirmar definitivamente.
          </p>
          <button
            type="button"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border border-[#cfc5b8] px-6 text-sm font-extrabold text-[#214e3b] transition hover:bg-white"
            onClick={() => setCreatedRequest(null)}
          >
            Solicitar otra hora
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <ServiceSelector
        selectedService={selectedService}
        register={register}
        error={errors.service?.message}
      />

      <div>
        <p className="eyebrow">Sobre tu mascota</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormField
            label="Nombre de tu mascota"
            error={errors.petName?.message}
          >
            <Input placeholder="Ej. Milo" {...register("petName")} />
          </FormField>
          <FormField
            label="Peso aproximado (kg)"
            error={errors.petWeightKg?.message}
            hint="La duración se calcula usando este peso."
          >
            <Input
              type="number"
              min={PET_WEIGHT_LIMITS.minKg}
              max={PET_WEIGHT_LIMITS.maxKg}
              step="0.1"
              placeholder="Ej. 12"
              {...register("petWeightKg", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </div>

      <div>
        <p className="eyebrow">Agenda disponible</p>
        <p className="mt-2 text-sm leading-6 text-[#75827b]">
          Elige un bloque compatible con el peso y servicio de tu mascota.
        </p>
        <div className="mt-4">
          <input type="hidden" {...register("startsAt")} />
          <AppointmentCalendar
            service={selectedService}
            petWeightKg={petWeightKg}
            selectedStartsAt={selectedStartsAt}
            error={errors.startsAt?.message}
            onSelect={(startsAt) => {
              setValue("startsAt", startsAt ?? "", {
                shouldDirty: true,
                shouldValidate: Boolean(startsAt),
              });
              if (startsAt) clearErrors("startsAt");
              setServerError(null);
            }}
          />
        </div>
      </div>

      <div>
        <p className="eyebrow">Tus datos de contacto</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <FormField label="Tu nombre" error={errors.ownerName?.message}>
            <Input
              placeholder="¿Cómo te llamas?"
              autoComplete="name"
              {...register("ownerName")}
            />
          </FormField>
          <FormField label="WhatsApp" error={errors.phone?.message}>
            <Input
              type="tel"
              placeholder="+56 9 1234 5678"
              autoComplete="tel"
              {...register("phone")}
            />
          </FormField>
        </div>
      </div>

      <FormField
        label="Correo (opcional)"
        error={errors.email?.message}
        hint="Lo usaremos solo para enviarte información sobre tu solicitud."
      >
        <Input
          type="email"
          placeholder="tu@correo.cl"
          autoComplete="email"
          {...register("email")}
        />
      </FormField>

      <FormField
        label="¿Hay algo que debamos saber?"
        error={errors.notes?.message}
        hint="Por ejemplo: si se pone nervioso, tiene piel sensible o necesita pausas."
      >
        <textarea
          className="form-control min-h-28 resize-y py-3"
          placeholder="Cuéntanos un poquito sobre su personalidad..."
          {...register("notes")}
        />
      </FormField>

      {serverError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#214e3b] px-8 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(33,78,59,0.2)] transition hover:-translate-y-0.5 hover:bg-[#173c2c] disabled:pointer-events-none disabled:opacity-60"
      >
        {mutation.isPending
          ? "Registrando solicitud..."
          : "Solicitar esta hora"}
        <Send className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-center text-xs leading-5 text-[#7b8780]">
        La solicitud bloquea el horario para evitar dobles reservas. La atención
        queda confirmada cuando nuestro equipo te contacta.
      </p>
    </form>
  );
}

interface ServiceSelectorProps {
  error?: string | undefined;
  register: UseFormRegister<CreatePublicAppointmentRequestInput>;
  selectedService: AppointmentService;
}

function ServiceSelector({
  error,
  register,
  selectedService,
}: ServiceSelectorProps): JSX.Element {
  return (
    <div>
      <p className="eyebrow">Elige su cuidado</p>
      <h3 className="mt-2 font-display text-2xl text-[#183c2d]">
        ¿Qué necesita esta vez?
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {serviceOptions.map((option) => {
          const selected = selectedService === option.value;

          return (
            <label
              key={option.value}
              className={`relative cursor-pointer rounded-[1.15rem] border p-4 transition ${
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
              {option.badge ? (
                <span className="absolute right-3 top-3 rounded-full bg-[#214e3b] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
                  {option.badge}
                </span>
              ) : null}
              <span className="mt-3 block font-extrabold text-[#2b483a]">
                {option.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#75827b]">
                {option.description}
              </span>
              {selected && !option.badge ? (
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-[#214e3b]" />
              ) : null}
            </label>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

async function shareRequestSummary(
  values: CreatePublicAppointmentRequestInput,
  request: PublicAppointmentRequestDto,
): Promise<void> {
  const service =
    serviceOptions.find((option) => option.value === values.service)?.label ??
    values.service;
  const message = [
    "Hola Caninany, registré una solicitud de hora.",
    `Código: ${request.id}`,
    `Humano: ${values.ownerName}`,
    `Teléfono: ${values.phone}`,
    `Mascota: ${values.petName}`,
    `Peso aproximado: ${values.petWeightKg} kg`,
    `Servicio: ${service}`,
    `Horario: ${formatRequestDateTime(request.startsAt, request.endsAt)}`,
    values.email ? `Correo: ${values.email}` : "",
    values.notes ? `Notas: ${values.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );

  try {
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
  } catch {
    // The request is already persisted; sharing is an optional convenience.
  }
}

function formatRequestDateTime(startsAt: string, endsAt: string): string {
  const dateFormatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeFormatter = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${dateFormatter.format(new Date(startsAt))}, ${timeFormatter.format(
    new Date(startsAt),
  )}–${timeFormatter.format(new Date(endsAt))}`;
}
