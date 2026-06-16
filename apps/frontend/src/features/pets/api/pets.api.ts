import type { CreatePetInput, PetDto, UpdatePetInput } from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function getPets(): Promise<PetDto[]> {
  const response = await httpClient.get<PetDto[]>("/pets");
  return response.data;
}

export async function createPet(input: CreatePetInput): Promise<PetDto> {
  const response = await httpClient.post<PetDto>("/pets", input);
  return response.data;
}

export async function updatePet(
  petId: string,
  input: UpdatePetInput,
): Promise<PetDto> {
  const response = await httpClient.put<PetDto>(`/pets/${petId}`, input);
  return response.data;
}

export async function archivePet(petId: string): Promise<void> {
  await httpClient.delete<void>(`/pets/${petId}`);
}
