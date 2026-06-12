import { describe, expect, it } from "vitest";

import { Appointment } from "../../src/domain/entities/appointment.entity";
import { ScheduleConflictService } from "../../src/domain/services/schedule-conflict.service";

describe("ScheduleConflictService", () => {
  it("detects overlapping appointments", () => {
    const existing = Appointment.create({
      id: "existing",
      customerId: "customer",
      petId: "pet",
      service: "bath",
      startsAt: new Date("2026-06-20T12:00:00.000Z"),
      durationMinutes: 60,
    });

    expect(
      ScheduleConflictService.hasConflict(
        new Date("2026-06-20T12:30:00.000Z"),
        30,
        [existing],
      ),
    ).toBe(true);
  });

  it("allows adjacent appointments", () => {
    const existing = Appointment.create({
      id: "existing",
      customerId: "customer",
      petId: "pet",
      service: "bath",
      startsAt: new Date("2026-06-20T12:00:00.000Z"),
      durationMinutes: 60,
    });

    expect(
      ScheduleConflictService.hasConflict(
        new Date("2026-06-20T13:00:00.000Z"),
        30,
        [existing],
      ),
    ).toBe(false);
  });
});
