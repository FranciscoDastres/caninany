import type { AppointmentService, AvailableSlotsDto } from "@caninany/shared";

import { buildDayAvailability } from "../services/appointment-availability.service";
import type { BusinessCalendar } from "../ports/business-calendar.port";
import type { Clock } from "../ports/clock.port";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { AppointmentDurationPolicy } from "../../domain/services/appointment-duration.policy";
import { PetWeight } from "../../domain/value-objects/pet-weight";

export interface GetAvailableSlotsQuery {
  date: string;
  service: AppointmentService;
  petWeightKg: number;
}

export class GetAvailableSlotsUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly calendar: BusinessCalendar,
    private readonly clock: Clock,
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<AvailableSlotsDto> {
    const { dayStart, dayEnd, opening, closing } = this.calendar.getBusinessDay(
      query.date,
    );
    const existing = await this.appointments.findOverlapping(
      dayStart,
      new Date(dayEnd.getTime() + 1),
    );
    const durationMinutes = AppointmentDurationPolicy.calculate(
      query.service,
      PetWeight.create(query.petWeightKg),
    );
    const availability = buildDayAvailability({
      date: query.date,
      businessDay: { dayStart, dayEnd, opening, closing },
      durationMinutes,
      existing,
      now: this.clock.now(),
    });

    return {
      date: query.date,
      slots: availability.slots
        .filter((slot) => slot.status === "available")
        .map((slot) => slot.startsAt),
    };
  }
}
