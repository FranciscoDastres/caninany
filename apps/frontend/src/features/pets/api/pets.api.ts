import { httpClient } from "@/core/api/http-client";

export interface PetSummary {
  id: string;
  name: string;
  weightKg: number;
}

export async function getPets(): Promise<PetSummary[]> {
  const response = await httpClient.get<PetSummary[]>("/pets");
  return response.data;
}
