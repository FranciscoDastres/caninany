import type { AppointmentService, AvailableSlotsDto } from "@caninany/shared";

import type { BusinessCalendar } from "../ports/business-calendar.port";
import type { Clock } from "../ports/clock.port";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { AppointmentDurationPolicy } from "../../domain/services/appointment-duration.policy";
import { ScheduleConflictService } from "../../domain/services/schedule-conflict.service";
import { PetWeight } from "../../domain/value-objects/pet-weight";

export interface GetAvailableSlotsQuery {
  date: string;
  service: AppointmentService;
  petWeightKg: number;
}

export class GetAvailableSlotsUseCase {
  private readonly intervalMinutes = 30;

  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly calendar: BusinessCalendar,
    private readonly clock: Clock,
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<AvailableSlotsDto> {
    const { dayStart, dayEnd, opening, closing } = this.calendar.getBusinessDay(
      query.date,
    );
    const existing = await this.appointments.findBetween(dayStart, dayEnd);
    const durationMinutes = AppointmentDurationPolicy.calculate(
      query.service,
      PetWeight.create(query.petWeightKg),
    );

    const slots: string[] = [];
    for (
      let cursor = opening;
      cursor.getTime() + durationMinutes * 60_000 <= closing.getTime();
      cursor = new Date(cursor.getTime() + this.intervalMinutes * 60_000)
    ) {
      if (
        cursor.getTime() > this.clock.now().getTime() &&
        !ScheduleConflictService.hasConflict(cursor, durationMinutes, existing)
      ) {
        slots.push(cursor.toISOString());
      }
    }

    return { date: query.date, slots };
  }
}
