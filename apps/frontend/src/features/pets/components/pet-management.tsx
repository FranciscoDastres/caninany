import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPetSchema,
  PET_WEIGHT_LIMITS,
  type CreatePetInput,
  type PetDto,
} from "@caninany/shared";
import { Edit3, PawPrint, Plus, Save, Trash2, X } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/core/api/get-api-error";

import { archivePet, createPet, updatePet } from "../api/pets.api";
import { usePets } from "../hooks/use-pets";

const emptyPet: CreatePetInput = {
  name: "",
  breed: "",
  weightKg: Number.NaN,
  dateOfBirth: "",
  medicalNotes: "",
  behaviorNotes: "",
};

export function PetManagement(): JSX.Element {
  const queryClient = useQueryClient();
  const pets = usePets();
  const [editingPet, setEditingPet] = useState<PetDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    tone: "error" | "success";
  } | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<CreatePetInput>({
    resolver: zodResolver(createPetSchema),
    defaultValues: emptyPet,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: CreatePetInput) =>
      editingPet ? updatePet(editingPet.id, input) : createPet(input),
    onSuccess: async (pet) => {
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      setMessage({
        tone: "success",
        text: editingPet
          ? `${pet.name} fue actualizada correctamente.`
          : `${pet.name} fue agregada a tu perfil.`,
      });
      closeForm();
    },
    onError: (error) =>
      setMessage({
        tone: "error",
        text: getApiErrorMessage(error, "No fue posible guardar la mascota."),
      }),
  });
  const archiveMutation = useMutation({
    mutationFn: archivePet,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pets"] });
      setMessage({
        tone: "success",
        text: "La mascota fue retirada de tu perfil.",
      });
    },
    onError: (error) =>
      setMessage({
        tone: "error",
        text: getApiErrorMessage(error, "No fue posible retirar la mascota."),
      }),
  });

  const openCreateForm = (): void => {
    setEditingPet(null);
    reset(emptyPet);
    setMessage(null);
    setFormOpen(true);
  };
  const openEditForm = (pet: PetDto): void => {
    setEditingPet(pet);
    reset({
      name: pet.name,
      breed: pet.breed ?? "",
      weightKg: pet.weightKg,
      dateOfBirth: pet.dateOfBirth ?? "",
      medicalNotes: pet.medicalNotes ?? "",
      behaviorNotes: pet.behaviorNotes ?? "",
    });
    setMessage(null);
    setFormOpen(true);
  };
  const closeForm = (): void => {
    setEditingPet(null);
    setFormOpen(false);
    reset(emptyPet);
  };

  const onSubmit = handleSubmit(async (input) => {
    setMessage(null);
    await saveMutation.mutateAsync(input);
  });

  return (
    <article className="overflow-hidden rounded-[2rem] border border-[#e0d8cd] bg-white shadow-[0_18px_60px_rgba(35,67,52,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#ece5dc] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#f4dfd1] text-[#a65f40]">
            <PawPrint className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl text-[#183c2d]">
              Mis mascotas
            </h2>
            <p className="text-sm text-[#75827b]">
              Mantén sus datos listos para futuras reservas.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#214e3b] px-5 text-sm font-extrabold text-white"
          onClick={formOpen ? closeForm : openCreateForm}
        >
          {formOpen ? <X className="size-4" /> : <Plus className="size-4" />}
          {formOpen ? "Cerrar formulario" : "Agregar mascota"}
        </button>
      </div>

      {message ? (
        <p
          className={`mx-6 mt-5 rounded-xl px-4 py-3 text-sm font-semibold sm:mx-8 ${
            message.tone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-[#eef2e8] text-[#315f49]"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {formOpen ? (
        <form
          className="grid gap-5 border-b border-[#ece5dc] bg-[#fffaf3] p-6 sm:p-8"
          onSubmit={onSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <PetField label="Nombre" error={errors.name?.message}>
              <Input placeholder="Ej. Milo" {...register("name")} />
            </PetField>
            <PetField label="Raza" error={errors.breed?.message}>
              <Input
                placeholder="Ej. Mestizo o Poodle"
                {...register("breed")}
              />
            </PetField>
            <PetField label="Peso actual (kg)" error={errors.weightKg?.message}>
              <Input
                type="number"
                min={PET_WEIGHT_LIMITS.minKg}
                max={PET_WEIGHT_LIMITS.maxKg}
                step="0.1"
                {...register("weightKg", { valueAsNumber: true })}
              />
            </PetField>
            <PetField
              label="Fecha de nacimiento"
              error={errors.dateOfBirth?.message}
            >
              <Input type="date" {...register("dateOfBirth")} />
            </PetField>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PetField
              label="Cuidados de salud"
              error={errors.medicalNotes?.message}
              hint="Alergias, piel sensible, tratamientos o cuidados relevantes."
            >
              <textarea
                className="form-control min-h-28 resize-y py-3"
                {...register("medicalNotes")}
              />
            </PetField>
            <PetField
              label="Personalidad y comportamiento"
              error={errors.behaviorNotes?.message}
              hint="Miedos, señales de estrés y la mejor forma de acompañarle."
            >
              <textarea
                className="form-control min-h-28 resize-y py-3"
                {...register("behaviorNotes")}
              />
            </PetField>
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-[#214e3b] px-6 text-sm font-extrabold text-white disabled:opacity-60"
          >
            <Save className="size-4" />
            {saveMutation.isPending
              ? "Guardando..."
              : editingPet
                ? "Guardar cambios"
                : "Agregar mascota"}
          </button>
        </form>
      ) : null}

      {pets.isPending ? (
        <p className="px-8 py-12 text-center text-[#6d7b73]">
          Cargando tus mascotas...
        </p>
      ) : pets.isError ? (
        <p className="px-8 py-12 text-center font-semibold text-red-700">
          No fue posible cargar tus mascotas.
        </p>
      ) : pets.data.length === 0 ? (
        <div className="grid place-items-center px-8 py-14 text-center">
          <PawPrint className="size-10 text-[#b16d4b]" />
          <h3 className="mt-4 font-display text-2xl text-[#183c2d]">
            Agrega tu primera mascota.
          </h3>
          <p className="mt-2 max-w-md text-[#75827b]">
            Su peso y necesidades se usarán para calcular correctamente las
            próximas reservas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 xl:grid-cols-3">
          {pets.data.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              disabled={archiveMutation.isPending}
              onEdit={() => openEditForm(pet)}
              onArchive={() => {
                if (
                  window.confirm(
                    `¿Retirar a ${pet.name} de tu perfil? Sus reservas anteriores se conservarán.`,
                  )
                ) {
                  archiveMutation.mutate(pet.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </article>
  );
}

interface PetCardProps {
  disabled: boolean;
  onArchive: () => void;
  onEdit: () => void;
  pet: PetDto;
}

function PetCard({
  disabled,
  onArchive,
  onEdit,
  pet,
}: PetCardProps): JSX.Element {
  return (
    <section className="rounded-[1.5rem] border border-[#e5ddd2] bg-[#fffaf3] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-[#183c2d]">{pet.name}</h3>
          <p className="mt-1 text-sm text-[#75827b]">
            {pet.breed || "Raza no indicada"} · {pet.weightKg} kg
          </p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-[#dce8db] text-[#315f49]">
          <PawPrint className="size-4" />
        </span>
      </div>

      {pet.medicalNotes || pet.behaviorNotes ? (
        <div className="mt-5 space-y-3 border-t border-[#e8e0d6] pt-4 text-sm leading-6 text-[#607269]">
          {pet.medicalNotes ? (
            <p>
              <strong className="text-[#344e41]">Salud:</strong>{" "}
              {pet.medicalNotes}
            </p>
          ) : null}
          {pet.behaviorNotes ? (
            <p>
              <strong className="text-[#344e41]">Comportamiento:</strong>{" "}
              {pet.behaviorNotes}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-[#cfc5b8] text-sm font-bold text-[#214e3b]"
          onClick={onEdit}
        >
          <Edit3 className="size-4" />
          Editar
        </button>
        <button
          type="button"
          disabled={disabled}
          className="grid size-10 place-items-center rounded-full border border-[#e2c8bc] text-[#a44f35] disabled:opacity-50"
          aria-label={`Retirar a ${pet.name}`}
          onClick={onArchive}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </section>
  );
}

interface PetFieldProps {
  children: React.ReactNode;
  error?: string | undefined;
  hint?: string;
  label: string;
}

function PetField({
  children,
  error,
  hint,
  label,
}: PetFieldProps): JSX.Element {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-[#344e41]">
      {label}
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
