import { describe, expect, it, vi } from "vitest";

import { ListAdminAppointmentsUseCase } from "../../src/application/use-cases/list-admin-appointments.use-case";
import type { AppointmentRepository } from "../../src/domain/repositories/appointment.repository";

describe("ListAdminAppointmentsUseCase", () => {
  it("maps registered and public appointments for administration", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      listForAdmin: vi.fn(async () => [
        {
          id: "appointment-1",
          customerId: "customer-1",
          customerName: "Cliente Caninany",
          customerEmail: "cliente@caninany.cl",
          customerPhone: "+56 9 1111 1111",
          ownerName: null,
          ownerEmail: null,
          ownerPhone: null,
          petId: "pet-1",
          petName: "Milo",
          petWeightKg: 8,
          service: "bath" as const,
          startsAt: new Date("2026-06-20T13:00:00.000Z"),
          endsAt: new Date("2026-06-20T13:45:00.000Z"),
          durationMinutes: 45,
          status: "pending" as const,
          notes: null,
          createdAt: new Date("2026-06-14T12:00:00.000Z"),
        },
      ]),
      listByCustomer: vi.fn(async () => []),
      save: vi.fn(async () => undefined),
      updateStatus: vi.fn(async () => null),
    };
    const useCase = new ListAdminAppointmentsUseCase(appointments);

    await expect(useCase.execute()).resolves.toEqual([
      {
        id: "appointment-1",
        customerId: "customer-1",
        customerName: "Cliente Caninany",
        customerEmail: "cliente@caninany.cl",
        customerPhone: "+56 9 1111 1111",
        ownerName: null,
        ownerEmail: null,
        ownerPhone: null,
        petId: "pet-1",
        petName: "Milo",
        petWeightKg: 8,
        service: "bath",
        startsAt: "2026-06-20T13:00:00.000Z",
        endsAt: "2026-06-20T13:45:00.000Z",
        durationMinutes: 45,
        status: "pending",
        createdAt: "2026-06-14T12:00:00.000Z",
      },
    ]);
  });
});
