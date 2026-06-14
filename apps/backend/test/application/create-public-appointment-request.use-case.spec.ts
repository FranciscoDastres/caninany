import { describe, expect, it, vi } from "vitest";

import type { BusinessCalendar } from "../../src/application/ports/business-calendar.port";
import type { Clock } from "../../src/application/ports/clock.port";
import type { IdGenerator } from "../../src/application/ports/id-generator.port";
import { ScheduleAppointmentService } from "../../src/application/services/schedule-appointment.service";
import { CreatePublicAppointmentRequestUseCase } from "../../src/application/use-cases/create-public-appointment-request.use-case";
import { Appointment } from "../../src/domain/entities/appointment.entity";
import {
  AppointmentConflictError,
  AppointmentOutsideBusinessHoursError,
} from "../../src/domain/errors/domain.error";
import type { AppointmentRepository } from "../../src/domain/repositories/appointment.repository";

const ids: IdGenerator = { generate: () => "request-id" };
const clock: Clock = {
  now: () => new Date("2026-06-13T12:00:00.000Z"),
};
const calendar: BusinessCalendar = {
  getTimeZone: () => "America/Santiago",
  getDateForInstant: (instant) => instant.toISOString().slice(0, 10),
  getBusinessDay: (date) => ({
    dayStart: new Date(`${date}T00:00:00.000Z`),
    dayEnd: new Date(`${date}T23:59:59.999Z`),
    opening: new Date(`${date}T13:00:00.000Z`),
    closing: new Date(`${date}T22:00:00.000Z`),
  }),
};

describe("CreatePublicAppointmentRequestUseCase", () => {
  it("persists public contact data as a pending appointment", async () => {
    const persisted: Appointment[] = [];
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      save: vi.fn(async (appointment) => {
        persisted.push(appointment);
      }),
    };
    const useCase = new CreatePublicAppointmentRequestUseCase(
      new ScheduleAppointmentService(appointments, ids, clock, calendar),
    );

    const result = await useCase.execute({
      ownerName: "Camila",
      phone: "+56 9 1234 5678",
      email: "camila@example.cl",
      petName: "Milo",
      petWeightKg: 8,
      service: "bath-and-ear-cleaning",
      startsAt: "2026-06-20T13:00:00.000Z",
      notes: "Se pone nervioso con el secador.",
    });

    expect(result).toMatchObject({
      id: "request-id",
      durationMinutes: 60,
      status: "pending",
    });
    const savedAppointment = persisted[0];
    expect(savedAppointment).toBeDefined();
    expect(savedAppointment?.customerId).toBeUndefined();
    expect(savedAppointment?.publicRequester).toEqual({
      ownerName: "Camila",
      phone: "+56 9 1234 5678",
      email: "camila@example.cl",
      petName: "Milo",
      petWeightKg: 8,
    });
  });

  it("rejects a public request that overlaps an existing appointment", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => true),
      save: vi.fn(async () => undefined),
    };
    const useCase = new CreatePublicAppointmentRequestUseCase(
      new ScheduleAppointmentService(appointments, ids, clock, calendar),
    );

    await expect(
      useCase.execute({
        ownerName: "Camila",
        phone: "+56 9 1234 5678",
        petName: "Milo",
        petWeightKg: 8,
        service: "bath",
        startsAt: "2026-06-20T13:30:00.000Z",
      }),
    ).rejects.toBeInstanceOf(AppointmentConflictError);
    expect(appointments.save).not.toHaveBeenCalled();
  });

  it("rejects requests outside the configured schedule", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      save: vi.fn(async () => undefined),
    };
    const useCase = new CreatePublicAppointmentRequestUseCase(
      new ScheduleAppointmentService(appointments, ids, clock, calendar),
    );

    await expect(
      useCase.execute({
        ownerName: "Camila",
        phone: "+56 9 1234 5678",
        petName: "Milo",
        petWeightKg: 8,
        service: "bath",
        startsAt: "2026-06-20T12:30:00.000Z",
      }),
    ).rejects.toBeInstanceOf(AppointmentOutsideBusinessHoursError);
    expect(appointments.hasActiveOverlap).not.toHaveBeenCalled();
    expect(appointments.save).not.toHaveBeenCalled();
  });

  it("rejects requests outside the 30-minute slot grid", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => []),
      hasActiveOverlap: vi.fn(async () => false),
      save: vi.fn(async () => undefined),
    };
    const useCase = new CreatePublicAppointmentRequestUseCase(
      new ScheduleAppointmentService(appointments, ids, clock, calendar),
    );

    await expect(
      useCase.execute({
        ownerName: "Camila",
        phone: "+56 9 1234 5678",
        petName: "Milo",
        petWeightKg: 8,
        service: "bath",
        startsAt: "2026-06-20T13:15:00.000Z",
      }),
    ).rejects.toBeInstanceOf(AppointmentOutsideBusinessHoursError);
    expect(appointments.hasActiveOverlap).not.toHaveBeenCalled();
    expect(appointments.save).not.toHaveBeenCalled();
  });
});
