import type { JSX } from "react";

import { usePets } from "../hooks/use-pets";

export function PetSelector(): JSX.Element {
  const pets = usePets();

  return (
    <select disabled={pets.isPending}>
      <option value="">Selecciona una mascota</option>
      {pets.data?.map((pet) => (
        <option key={pet.id} value={pet.id}>
          {pet.name}
        </option>
      ))}
    </select>
  );
}
