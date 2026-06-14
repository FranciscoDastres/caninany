import type { AppointmentService } from "@caninany/shared";

import type { BusinessCalendar } from "../ports/business-calendar.port";
import type { Clock } from "../ports/clock.port";
import type { IdGenerator } from "../ports/id-generator.port";
import { APPOINTMENT_INTERVAL_MINUTES } from "./appointment-availability.service";
import {
  Appointment,
  type PublicAppointmentRequester,
} from "../../domain/entities/appointment.entity";
import {
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentOutsideBusinessHoursError,
} from "../../domain/errors/domain.error";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { AppointmentDurationPolicy } from "../../domain/services/appointment-duration.policy";
import { ScheduleConflictService } from "../../domain/services/schedule-conflict.service";
import { PetWeight } from "../../domain/value-objects/pet-weight";

export interface ScheduleAppointmentCommand {
  customerId?: string;
  petId?: string;
  publicRequester?: PublicAppointmentRequester;
  petWeightKg: number;
  service: AppointmentService;
  startsAt: Date;
  notes?: string;
}

export class ScheduleAppointmentService {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
    private readonly calendar: BusinessCalendar,
  ) {}

  async schedule(command: ScheduleAppointmentCommand): Promise<Appointment> {
    if (command.startsAt.getTime() <= this.clock.now().getTime()) {
      throw new AppointmentInPastError(
        "La hora seleccionada ya no está disponible.",
      );
    }

    const durationMinutes = AppointmentDurationPolicy.calculate(
      command.service,
      PetWeight.create(command.petWeightKg),
    );
    const endsAt = new Date(
      command.startsAt.getTime() + durationMinutes * 60_000,
    );
    this.validateBusinessHours(command.startsAt, endsAt);

    const existing = await this.appointments.findOverlapping(
      command.startsAt,
      endsAt,
    );

    if (
      ScheduleConflictService.hasConflict(
        command.startsAt,
        durationMinutes,
        existing,
      )
    ) {
      throw new AppointmentConflictError(
        "La hora acaba de ser tomada. Selecciona otro bloque disponible.",
      );
    }

    const appointment = Appointment.create({
      id: this.idGenerator.generate(),
      ...(command.customerId ? { customerId: command.customerId } : {}),
      ...(command.petId ? { petId: command.petId } : {}),
      ...(command.publicRequester
        ? { publicRequester: command.publicRequester }
        : {}),
      service: command.service,
      startsAt: command.startsAt,
      durationMinutes,
      ...(command.notes ? { notes: command.notes } : {}),
    });

    await this.appointments.save(appointment);
    return appointment;
  }

  private validateBusinessHours(startsAt: Date, endsAt: Date): void {
    const businessDate = this.calendar.getDateForInstant(startsAt);
    const businessDay = this.calendar.getBusinessDay(businessDate);
    const startsOutsideBusinessHours =
      startsAt.getTime() < businessDay.opening.getTime() ||
      endsAt.getTime() > businessDay.closing.getTime();
    const minutesFromOpening =
      (startsAt.getTime() - businessDay.opening.getTime()) / 60_000;
    const isAlignedWithSchedule =
      Number.isInteger(minutesFromOpening) &&
      minutesFromOpening % APPOINTMENT_INTERVAL_MINUTES === 0;

    if (startsOutsideBusinessHours || !isAlignedWithSchedule) {
      throw new AppointmentOutsideBusinessHoursError(
        "La hora seleccionada no pertenece al horario disponible.",
      );
    }
  }
}
