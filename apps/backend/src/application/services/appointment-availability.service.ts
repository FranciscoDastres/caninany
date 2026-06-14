import type { AppointmentCalendarDayDto } from "@caninany/shared";

import type { BusinessDay } from "../ports/business-calendar.port";
import type { AppointmentBusyPeriod } from "../../domain/repositories/appointment.repository";

export const APPOINTMENT_INTERVAL_MINUTES = 30;

interface BuildDayAvailabilityInput {
  businessDay: BusinessDay;
  busyPeriods: AppointmentBusyPeriod[];
  date: string;
  durationMinutes: number;
  now: Date;
}

export function buildDayAvailability({
  businessDay,
  busyPeriods,
  date,
  durationMinutes,
  now,
}: BuildDayAvailabilityInput): AppointmentCalendarDayDto {
  const isPast = businessDay.closing.getTime() <= now.getTime();
  if (isPast) {
    return {
      date,
      isPast: true,
      availableCount: 0,
      busyCount: 0,
      slots: [],
      busyPeriods: [],
    };
  }

  const relevantBusyPeriods = busyPeriods.filter(
    (period) => period.endsAt.getTime() > now.getTime(),
  );
  const slots: AppointmentCalendarDayDto["slots"] = [];
  let availableCount = 0;
  let busyPeriodIndex = 0;

  for (
    let cursor = businessDay.opening;
    cursor.getTime() + durationMinutes * 60_000 <=
    businessDay.closing.getTime();
    cursor = new Date(cursor.getTime() + APPOINTMENT_INTERVAL_MINUTES * 60_000)
  ) {
    const endsAt = new Date(cursor.getTime() + durationMinutes * 60_000);
    if (cursor.getTime() <= now.getTime()) continue;

    let busyPeriod = relevantBusyPeriods[busyPeriodIndex];
    while (busyPeriod && busyPeriod.endsAt.getTime() <= cursor.getTime()) {
      busyPeriodIndex += 1;
      busyPeriod = relevantBusyPeriods[busyPeriodIndex];
    }

    const status =
      busyPeriod && busyPeriod.startsAt.getTime() < endsAt.getTime()
        ? "occupied"
        : "available";
    if (status === "available") availableCount += 1;

    slots.push({
      startsAt: cursor.toISOString(),
      endsAt: endsAt.toISOString(),
      status,
    });
  }

  return {
    date,
    isPast: false,
    availableCount,
    busyCount: relevantBusyPeriods.length,
    slots,
    busyPeriods: relevantBusyPeriods.map((period) => ({
      startsAt: period.startsAt.toISOString(),
      endsAt: period.endsAt.toISOString(),
    })),
  };
}
