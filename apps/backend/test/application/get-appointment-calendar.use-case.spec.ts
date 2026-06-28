import { describe, expect, it, vi } from "vitest";

import type { BusinessCalendar } from "../../src/application/ports/business-calendar.port";
import type { Clock } from "../../src/application/ports/clock.port";
import { GetAppointmentCalendarUseCase } from "../../src/application/use-cases/get-appointment-calendar.use-case";
import type { AppointmentRepository } from "../../src/domain/repositories/appointment.repository";

const calendar: BusinessCalendar = {
  getTimeZone: () => "America/Santiago",
  getDateForInstant: (instant) => instant.toISOString().slice(0, 10),
  getBusinessDay: (date) => {
    const start = new Date(`${date}T00:00:00.000Z`);
    const nextDay = new Date(start);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return {
      dayStart: start,
      dayEnd: new Date(nextDay.getTime() - 1),
      opening: new Date(`${date}T09:00:00.000Z`),
      closing: new Date(`${date}T18:00:00.000Z`),
    };
  },
};

const occupiedPeriod = {
  startsAt: new Date("2026-06-20T09:00:00.000Z"),
  endsAt: new Date("2026-06-20T10:00:00.000Z"),
};

describe("GetAppointmentCalendarUseCase", () => {
  it("returns monthly availability and anonymized busy periods", async () => {
    const appointments: AppointmentRepository = {
      findBusyPeriods: vi.fn(async () => [occupiedPeriod]),
      hasActiveOverlap: vi.fn(async () => false),
      listForAdmin: vi.fn(async () => []),
      listByCustomer: vi.fn(async () => []),
      save: vi.fn(async () => undefined),
      updateStatus: vi.fn(async () => null),
    };
    const clock: Clock = {
      now: () => new Date("2026-06-13T12:00:00.000Z"),
    };
    const useCase = new GetAppointmentCalendarUseCase(
      appointments,
      calendar,
      clock,
    );

    const result = await useCase.execute({
      month: "2026-06",
      service: "bath-and-ear-cleaning",
      petWeightKg: 5,
    });
    const occupiedDay = result.days.find((day) => day.date === "2026-06-20");
    const currentDay = result.days.find((day) => day.date === "2026-06-13");
    const pastDay = result.days.find((day) => day.date === "2026-06-12");

    expect(result.timeZone).toBe("America/Santiago");
    expect(result.durationMinutes).toBe(60);
    expect(result.days).toHaveLength(30);
    expect(occupiedDay?.busyCount).toBe(1);
    expect(occupiedDay?.busyPeriods).toEqual([
      {
        startsAt: "2026-06-20T09:00:00.000Z",
        endsAt: "2026-06-20T10:00:00.000Z",
      },
    ]);
    expect(
      occupiedDay?.slots.find(
        (slot) => slot.startsAt === "2026-06-20T09:00:00.000Z",
      )?.status,
    ).toBe("occupied");
    expect(
      occupiedDay?.slots.find(
        (slot) => slot.startsAt === "2026-06-20T10:00:00.000Z",
      )?.status,
    ).toBe("available");
    expect(pastDay?.isPast).toBe(true);
    expect(pastDay?.availableCount).toBe(0);
    expect(pastDay?.slots).toEqual([]);
    expect(
      currentDay?.slots.every(
        (slot) => new Date(slot.startsAt).getTime() > clock.now().getTime(),
      ),
    ).toBe(true);
  });
});
