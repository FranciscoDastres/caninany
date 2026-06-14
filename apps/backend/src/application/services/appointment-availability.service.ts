import type { AppointmentCalendarDayDto } from "@caninany/shared";

import type { BusinessDay } from "../ports/business-calendar.port";
import type { Appointment } from "../../domain/entities/appointment.entity";
import { ScheduleConflictService } from "../../domain/services/schedule-conflict.service";

export const APPOINTMENT_INTERVAL_MINUTES = 30;

interface BuildDayAvailabilityInput {
  businessDay: BusinessDay;
  date: string;
  durationMinutes: number;
  existing: Appointment[];
  now: Date;
}

export function buildDayAvailability({
  businessDay,
  date,
  durationMinutes,
  existing,
  now,
}: BuildDayAvailabilityInput): AppointmentCalendarDayDto {
  const relevantAppointments = existing
    .filter(
      (appointment) =>
        appointment.startsAt.getTime() < businessDay.dayEnd.getTime() + 1 &&
        appointment.endsAt.getTime() > businessDay.dayStart.getTime(),
    )
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());

  const slots: AppointmentCalendarDayDto["slots"] = [];
  for (
    let cursor = businessDay.opening;
    cursor.getTime() + durationMinutes * 60_000 <=
    businessDay.closing.getTime();
    cursor = new Date(cursor.getTime() + APPOINTMENT_INTERVAL_MINUTES * 60_000)
  ) {
    const endsAt = new Date(cursor.getTime() + durationMinutes * 60_000);
    const status =
      cursor.getTime() <= now.getTime()
        ? "past"
        : ScheduleConflictService.hasConflict(
              cursor,
              durationMinutes,
              relevantAppointments,
            )
          ? "occupied"
          : "available";

    slots.push({
      startsAt: cursor.toISOString(),
      endsAt: endsAt.toISOString(),
      status,
    });
  }

  return {
    date,
    isPast: businessDay.closing.getTime() <= now.getTime(),
    availableCount: slots.filter((slot) => slot.status === "available").length,
    busyCount: relevantAppointments.length,
    slots,
    busyPeriods: relevantAppointments.map((appointment) => ({
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
    })),
  };
}
