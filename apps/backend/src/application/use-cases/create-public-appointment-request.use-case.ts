import type {
  CreatePublicAppointmentRequestInput,
  PublicAppointmentRequestDto,
} from "@caninany/shared";

import { ScheduleAppointmentService } from "../services/schedule-appointment.service";

export class CreatePublicAppointmentRequestUseCase {
  constructor(private readonly scheduler: ScheduleAppointmentService) {}

  async execute(
    input: CreatePublicAppointmentRequestInput,
  ): Promise<PublicAppointmentRequestDto> {
    const appointment = await this.scheduler.schedule({
      publicRequester: {
        ownerName: input.ownerName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
        petName: input.petName,
        petWeightKg: input.petWeightKg,
      },
      petWeightKg: input.petWeightKg,
      service: input.service,
      startsAt: new Date(input.startsAt),
      ...(input.notes ? { notes: input.notes } : {}),
    });

    return {
      id: appointment.id,
      service: appointment.service,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      status: "pending",
    };
  }
}
