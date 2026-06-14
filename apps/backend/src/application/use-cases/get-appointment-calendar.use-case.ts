import type {
  AppointmentCalendarDto,
  AppointmentService,
} from "@caninany/shared";

import {
  APPOINTMENT_INTERVAL_MINUTES,
  buildDayAvailability,
} from "../services/appointment-availability.service";
import type { BusinessCalendar } from "../ports/business-calendar.port";
import type { Clock } from "../ports/clock.port";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { AppointmentDurationPolicy } from "../../domain/services/appointment-duration.policy";
import { PetWeight } from "../../domain/value-objects/pet-weight";

export interface GetAppointmentCalendarQuery {
  month: string;
  service: AppointmentService;
  petWeightKg: number;
}

export class GetAppointmentCalendarUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly calendar: BusinessCalendar,
    private readonly clock: Clock,
  ) {}

  async execute(
    query: GetAppointmentCalendarQuery,
  ): Promise<AppointmentCalendarDto> {
    const [year, monthNumber] = query.month.split("-").map(Number);
    if (!year || !monthNumber) {
      throw new Error(`Invalid calendar month: ${query.month}`);
    }

    const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const firstDate = `${query.month}-01`;
    const nextMonthDate = new Date(Date.UTC(year, monthNumber, 1));
    const nextMonth = nextMonthDate.toISOString().slice(0, 7);
    const rangeStart = this.calendar.getBusinessDay(firstDate).dayStart;
    const rangeEnd = this.calendar.getBusinessDay(`${nextMonth}-01`).dayStart;
    const existing = await this.appointments.findOverlapping(
      rangeStart,
      rangeEnd,
    );
    const durationMinutes = AppointmentDurationPolicy.calculate(
      query.service,
      PetWeight.create(query.petWeightKg),
    );
    const now = this.clock.now();

    return {
      month: query.month,
      timeZone: this.calendar.getTimeZone(),
      intervalMinutes: APPOINTMENT_INTERVAL_MINUTES,
      durationMinutes,
      days: Array.from({ length: daysInMonth }, (_, index) => {
        const date = `${query.month}-${String(index + 1).padStart(2, "0")}`;
        return buildDayAvailability({
          date,
          businessDay: this.calendar.getBusinessDay(date),
          durationMinutes,
          existing,
          now,
        });
      }),
    };
  }
}
