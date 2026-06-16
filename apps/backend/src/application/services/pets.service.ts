import type { CreatePetInput, PetDto, UpdatePetInput } from "@caninany/shared";

import type { IdGenerator } from "../ports/id-generator.port";
import { PetNotFoundError } from "../../domain/errors/domain.error";
import type {
  PetRecord,
  PetRepository,
  SavePetRecord,
} from "../../domain/repositories/pet.repository";

export class PetsService {
  constructor(
    private readonly pets: PetRepository,
    private readonly ids: IdGenerator,
  ) {}

  async listForOwner(ownerId: string): Promise<PetDto[]> {
    return (await this.pets.findActiveByOwnerId(ownerId)).map((pet) =>
      this.toDto(pet),
    );
  }

  async create(ownerId: string, input: CreatePetInput): Promise<PetDto> {
    return this.toDto(
      await this.pets.create({
        id: this.ids.generate(),
        ownerId,
        ...this.toSaveRecord(input),
      }),
    );
  }

  async update(
    ownerId: string,
    petId: string,
    input: UpdatePetInput,
  ): Promise<PetDto> {
    await this.requireOwnedActivePet(ownerId, petId);
    return this.toDto(await this.pets.update(petId, this.toSaveRecord(input)));
  }

  async archive(ownerId: string, petId: string): Promise<void> {
    await this.requireOwnedActivePet(ownerId, petId);
    await this.pets.archive(petId);
  }

  private async requireOwnedActivePet(
    ownerId: string,
    petId: string,
  ): Promise<PetRecord> {
    const pet = await this.pets.findById(petId);
    if (!pet || pet.ownerId !== ownerId || pet.archivedAt) {
      throw new PetNotFoundError("La mascota no existe o no está disponible.");
    }
    return pet;
  }

  private toSaveRecord(input: CreatePetInput | UpdatePetInput): SavePetRecord {
    return {
      name: input.name,
      weightKg: input.weightKg,
      breed: input.breed?.trim() || null,
      dateOfBirth: input.dateOfBirth
        ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
        : null,
      medicalNotes: input.medicalNotes?.trim() || null,
      behaviorNotes: input.behaviorNotes?.trim() || null,
    };
  }

  private toDto(pet: PetRecord): PetDto {
    return {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      weightKg: pet.weightKg,
      dateOfBirth: pet.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      medicalNotes: pet.medicalNotes,
      behaviorNotes: pet.behaviorNotes,
      archivedAt: pet.archivedAt?.toISOString() ?? null,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    };
  }
}
