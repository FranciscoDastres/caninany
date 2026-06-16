import type { AppointmentDto, AppointmentService } from "@caninany/shared";

import { ScheduleAppointmentService } from "../services/schedule-appointment.service";
import { PetNotFoundError } from "../../domain/errors/domain.error";
import type { PetRepository } from "../../domain/repositories/pet.repository";

export interface CreateAppointmentCommand {
  customerId: string;
  petId: string;
  service: AppointmentService;
  startsAt: Date;
  notes?: string;
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly scheduler: ScheduleAppointmentService,
    private readonly pets: PetRepository,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<AppointmentDto> {
    const pet = await this.pets.findById(command.petId);
    if (!pet || pet.archivedAt || pet.ownerId !== command.customerId) {
      throw new PetNotFoundError(
        "La mascota no existe o no pertenece al cliente.",
      );
    }

    const appointment = await this.scheduler.schedule({
      customerId: command.customerId,
      petId: command.petId,
      petWeightKg: pet.weightKg,
      service: command.service,
      startsAt: command.startsAt,
      ...(command.notes ? { notes: command.notes } : {}),
    });

    return {
      id: appointment.id,
      customerId: appointment.customerId ?? null,
      petId: appointment.petId ?? null,
      service: appointment.service,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      ...(appointment.notes ? { notes: appointment.notes } : {}),
    };
  }
}
