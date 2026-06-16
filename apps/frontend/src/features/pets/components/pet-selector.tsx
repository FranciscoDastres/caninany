import type { PetDto } from "@caninany/shared";
import type { JSX } from "react";

import { usePets } from "../hooks/use-pets";

interface PetSelectorProps {
  disabled?: boolean;
  onChange: (pet: PetDto | null) => void;
  value: string;
}

export function PetSelector({
  disabled = false,
  onChange,
  value,
}: PetSelectorProps): JSX.Element {
  const pets = usePets();

  return (
    <select
      className="form-control"
      disabled={disabled || pets.isPending}
      value={value}
      onChange={(event) => {
        const pet =
          pets.data?.find((candidate) => candidate.id === event.target.value) ??
          null;
        onChange(pet);
      }}
    >
      <option value="">Selecciona una mascota</option>
      {pets.data?.map((pet) => (
        <option key={pet.id} value={pet.id}>
          {pet.name} · {pet.weightKg} kg
        </option>
      ))}
    </select>
  );
}
