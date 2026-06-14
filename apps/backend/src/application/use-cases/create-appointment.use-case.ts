import type { AppointmentDto, AppointmentService } from "@caninany/shared";

import { ScheduleAppointmentService } from "../services/schedule-appointment.service";

export interface CreateAppointmentCommand {
  customerId: string;
  petId: string;
  petWeightKg: number;
  service: AppointmentService;
  startsAt: Date;
  notes?: string;
}

export class CreateAppointmentUseCase {
  constructor(private readonly scheduler: ScheduleAppointmentService) {}

  async execute(command: CreateAppointmentCommand): Promise<AppointmentDto> {
    const appointment = await this.scheduler.schedule({
      customerId: command.customerId,
      petId: command.petId,
      petWeightKg: command.petWeightKg,
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
