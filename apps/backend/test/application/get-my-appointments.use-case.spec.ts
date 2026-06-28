import { describe, expect, it, vi } from "vitest";

import { GetMyAppointmentsUseCase } from "../../src/application/use-cases/get-my-appointments.use-case";
import type { AppointmentRepository } from "../../src/domain/repositories/appointment.repository";

describe("GetMyAppointmentsUseCase", () => {
  it("maps customer appointments to public DTOs", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      listForAdmin: vi.fn(async () => []),
      listByCustomer: vi.fn(async () => [
        {
          id: "appointment-1",
          customerId: "customer-1",
          petId: "pet-1",
          petName: "Milo",
          service: "bath" as const,
          startsAt: new Date("2026-06-20T13:00:00.000Z"),
          endsAt: new Date("2026-06-20T13:45:00.000Z"),
          durationMinutes: 45,
          status: "confirmed" as const,
          notes: "Traer correa.",
        },
      ]),
      save: vi.fn(async () => undefined),
      updateStatus: vi.fn(async () => null),
    };
    const useCase = new GetMyAppointmentsUseCase(appointments);

    await expect(useCase.execute("customer-1")).resolves.toEqual([
      {
        id: "appointment-1",
        customerId: "customer-1",
        petId: "pet-1",
        petName: "Milo",
        service: "bath",
        startsAt: "2026-06-20T13:00:00.000Z",
        endsAt: "2026-06-20T13:45:00.000Z",
        durationMinutes: 45,
        status: "confirmed",
        notes: "Traer correa.",
      },
    ]);
    expect(appointments.listByCustomer).toHaveBeenCalledWith("customer-1");
  });
});
