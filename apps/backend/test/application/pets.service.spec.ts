import { describe, expect, it, vi } from "vitest";

import { PetsService } from "../../src/application/services/pets.service";
import { PetNotFoundError } from "../../src/domain/errors/domain.error";
import type {
  CreatePetRecord,
  PetRecord,
  PetRepository,
  SavePetRecord,
} from "../../src/domain/repositories/pet.repository";

const pet: PetRecord = {
  id: "6a090910-ff64-4644-a975-f41605fd2d44",
  ownerId: "15b052a2-026c-46d3-87ba-c326e3be81bc",
  name: "Milo",
  breed: "Mestizo",
  weightKg: 12.5,
  dateOfBirth: new Date("2022-04-10T00:00:00.000Z"),
  medicalNotes: "Piel sensible.",
  behaviorNotes: null,
  archivedAt: null,
  createdAt: new Date("2026-06-14T12:00:00.000Z"),
  updatedAt: new Date("2026-06-14T12:00:00.000Z"),
};

function createRepository(): PetRepository {
  return {
    archive: vi.fn(async () => ({ ...pet, archivedAt: new Date() })),
    create: vi.fn(async (input: CreatePetRecord) => ({
      ...pet,
      ...input,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      archivedAt: null,
    })),
    findActiveByOwnerId: vi.fn(async () => [pet]),
    findById: vi.fn(async () => pet),
    update: vi.fn(async (_id: string, input: SavePetRecord) => ({
      ...pet,
      ...input,
    })),
  };
}

describe("PetsService", () => {
  it("creates a pet for the authenticated owner and normalizes optional fields", async () => {
    const repository = createRepository();
    const service = new PetsService(repository, {
      generate: () => pet.id,
    });

    const result = await service.create(pet.ownerId, {
      name: "Milo",
      breed: "",
      weightKg: 12.5,
      dateOfBirth: "2022-04-10",
      medicalNotes: " Piel sensible. ",
      behaviorNotes: "",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: pet.id,
        ownerId: pet.ownerId,
        breed: null,
        medicalNotes: "Piel sensible.",
        behaviorNotes: null,
        dateOfBirth: new Date("2022-04-10T00:00:00.000Z"),
      }),
    );
    expect(result.dateOfBirth).toBe("2022-04-10");
  });

  it("does not allow updating another owner's pet", async () => {
    const repository = createRepository();
    const service = new PetsService(repository, {
      generate: () => pet.id,
    });

    await expect(
      service.update("another-owner", pet.id, {
        name: "Milo",
        weightKg: 13,
      }),
    ).rejects.toBeInstanceOf(PetNotFoundError);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("archives an owned pet instead of deleting its history", async () => {
    const repository = createRepository();
    const service = new PetsService(repository, {
      generate: () => pet.id,
    });

    await service.archive(pet.ownerId, pet.id);

    expect(repository.archive).toHaveBeenCalledWith(pet.id);
  });
});
