import { describe, expect, it, vi } from "vitest";

import { UpdateAppointmentStatusUseCase } from "../../src/application/use-cases/update-appointment-status.use-case";
import { AppointmentNotFoundError } from "../../src/domain/errors/domain.error";
import type { AppointmentRepository } from "../../src/domain/repositories/appointment.repository";

describe("UpdateAppointmentStatusUseCase", () => {
  it("updates an appointment status and returns the admin DTO", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      listForAdmin: vi.fn(async () => []),
      listByCustomer: vi.fn(async () => []),
      save: vi.fn(async () => undefined),
      updateStatus: vi.fn(async () => ({
        id: "appointment-1",
        customerId: null,
        customerName: null,
        customerEmail: null,
        customerPhone: null,
        ownerName: "Camila",
        ownerEmail: "camila@example.cl",
        ownerPhone: "+56 9 1234 5678",
        petId: null,
        petName: "Milo",
        petWeightKg: 8,
        service: "bath-and-ear-cleaning" as const,
        startsAt: new Date("2026-06-20T13:00:00.000Z"),
        endsAt: new Date("2026-06-20T14:00:00.000Z"),
        durationMinutes: 60,
        status: "confirmed" as const,
        notes: "Se pone nervioso.",
        createdAt: new Date("2026-06-14T12:00:00.000Z"),
      })),
    };
    const useCase = new UpdateAppointmentStatusUseCase(appointments);

    await expect(
      useCase.execute("appointment-1", "confirmed"),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "appointment-1",
        ownerName: "Camila",
        petName: "Milo",
        status: "confirmed",
      }),
    );
    expect(appointments.updateStatus).toHaveBeenCalledWith(
      "appointment-1",
      "confirmed",
    );
  });

  it("rejects unknown appointments", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      listForAdmin: vi.fn(async () => []),
      listByCustomer: vi.fn(async () => []),
      save: vi.fn(async () => undefined),
      updateStatus: vi.fn(async () => null),
    };
    const useCase = new UpdateAppointmentStatusUseCase(appointments);

    await expect(
      useCase.execute("missing-appointment", "cancelled"),
    ).rejects.toBeInstanceOf(AppointmentNotFoundError);
  });
});
