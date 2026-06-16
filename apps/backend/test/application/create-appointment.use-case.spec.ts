import { describe, expect, it, vi } from "vitest";

import type { ScheduleAppointmentService } from "../../src/application/services/schedule-appointment.service";
import { CreateAppointmentUseCase } from "../../src/application/use-cases/create-appointment.use-case";
import { Appointment } from "../../src/domain/entities/appointment.entity";
import { PetNotFoundError } from "../../src/domain/errors/domain.error";
import type {
  PetRecord,
  PetRepository,
} from "../../src/domain/repositories/pet.repository";

const pet: PetRecord = {
  id: "6a090910-ff64-4644-a975-f41605fd2d44",
  ownerId: "15b052a2-026c-46d3-87ba-c326e3be81bc",
  name: "Milo",
  breed: null,
  weightKg: 18,
  dateOfBirth: null,
  medicalNotes: null,
  behaviorNotes: null,
  archivedAt: null,
  createdAt: new Date("2026-06-14T12:00:00.000Z"),
  updatedAt: new Date("2026-06-14T12:00:00.000Z"),
};

function createPetRepository(record: PetRecord | null): PetRepository {
  return {
    archive: vi.fn(async () => {
      throw new Error("unused");
    }),
    create: vi.fn(async () => {
      throw new Error("unused");
    }),
    findActiveByOwnerId: vi.fn(async () => []),
    findById: vi.fn(async () => record),
    update: vi.fn(async () => {
      throw new Error("unused");
    }),
  };
}

describe("CreateAppointmentUseCase", () => {
  it("uses the persisted pet weight instead of accepting it from the client", async () => {
    const appointment = Appointment.create({
      id: "appointment-id",
      customerId: pet.ownerId,
      petId: pet.id,
      service: "bath",
      startsAt: new Date("2026-06-20T13:00:00.000Z"),
      durationMinutes: 60,
    });
    const scheduler = {
      schedule: vi.fn(async () => appointment),
    } as unknown as ScheduleAppointmentService;
    const useCase = new CreateAppointmentUseCase(
      scheduler,
      createPetRepository(pet),
    );

    await useCase.execute({
      customerId: pet.ownerId,
      petId: pet.id,
      service: "bath",
      startsAt: appointment.startsAt,
    });

    expect(scheduler.schedule).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: pet.ownerId,
        petId: pet.id,
        petWeightKg: 18,
      }),
    );
  });

  it("rejects a pet that does not belong to the customer", async () => {
    const scheduler = {
      schedule: vi.fn(),
    } as unknown as ScheduleAppointmentService;
    const useCase = new CreateAppointmentUseCase(
      scheduler,
      createPetRepository(pet),
    );

    await expect(
      useCase.execute({
        customerId: "another-owner",
        petId: pet.id,
        service: "bath",
        startsAt: new Date("2026-06-20T13:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(PetNotFoundError);
    expect(scheduler.schedule).not.toHaveBeenCalled();
  });
});
