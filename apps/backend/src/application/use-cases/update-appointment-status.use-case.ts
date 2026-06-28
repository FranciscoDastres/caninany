import type { AdminAppointmentDto, AppointmentStatus } from "@caninany/shared";

import { AppointmentNotFoundError } from "../../domain/errors/domain.error";
import type { AppointmentRepository } from "../../domain/repositories/appointment.repository";
import { toAdminAppointmentDto } from "./list-admin-appointments.use-case";

export class UpdateAppointmentStatusUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(
    id: string,
    status: AppointmentStatus,
  ): Promise<AdminAppointmentDto> {
    const appointment = await this.appointments.updateStatus(id, status);
    if (!appointment) {
      throw new AppointmentNotFoundError("La cita no existe.");
    }

    return toAdminAppointmentDto(appointment);
  }
}
