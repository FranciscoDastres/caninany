import type { AppointmentDto, AppointmentService } from "@caninany/shared";

import type { Clock } from "../ports/clock.port";
import type { IdGenerator } from "../ports/id-generator.port";
import { Appointment } from "../../domain/entities/appointment.entity";
import {
  AppointmentConflictError,
  AppointmentInPastError,
} from "../../domain/errors/domain.error";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { AppointmentDurationPolicy } from "../../domain/services/appointment-duration.policy";
import { ScheduleConflictService } from "../../domain/services/schedule-conflict.service";
import { PetWeight } from "../../domain/value-objects/pet-weight";

export interface CreateAppointmentCommand {
  customerId: string;
  petId: string;
  petWeightKg: number;
  service: AppointmentService;
  startsAt: Date;
  notes?: string;
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<AppointmentDto> {
    if (command.startsAt.getTime() <= this.clock.now().getTime()) {
      throw new AppointmentInPastError(
        "Appointments must be scheduled in the future.",
      );
    }

    const weight = PetWeight.create(command.petWeightKg);
    const durationMinutes = AppointmentDurationPolicy.calculate(
      command.service,
      weight,
    );
    const endsAt = new Date(
      command.startsAt.getTime() + durationMinutes * 60_000,
    );
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
        "The requested time overlaps another appointment.",
      );
    }

    const appointment = Appointment.create({
      id: this.idGenerator.generate(),
      customerId: command.customerId,
      petId: command.petId,
      service: command.service,
      startsAt: command.startsAt,
      durationMinutes,
      ...(command.notes ? { notes: command.notes } : {}),
    });

    await this.appointments.save(appointment);

    return {
      id: appointment.id,
      customerId: appointment.customerId,
      petId: appointment.petId,
      service: appointment.service,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      ...(appointment.notes ? { notes: appointment.notes } : {}),
    };
  }
}
