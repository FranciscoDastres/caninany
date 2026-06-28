import type { AppointmentDto } from "@caninany/shared";

import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";

export class GetMyAppointmentsUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(customerId: string): Promise<AppointmentDto[]> {
    return (await this.appointments.listByCustomer(customerId)).map(
      (appointment) => ({
        id: appointment.id,
        customerId: appointment.customerId,
        petId: appointment.petId,
        petName: appointment.petName,
        service: appointment.service,
        startsAt: appointment.startsAt.toISOString(),
        endsAt: appointment.endsAt.toISOString(),
        durationMinutes: appointment.durationMinutes,
        status: appointment.status,
        ...(appointment.notes ? { notes: appointment.notes } : {}),
      }),
    );
  }
}
