import type { AdminAppointmentDto } from "@caninany/shared";

import type {
  AdminAppointmentRecord,
  AppointmentRepository,
} from "../../domain/repositories/appointment.repository";

export class ListAdminAppointmentsUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(): Promise<AdminAppointmentDto[]> {
    return (await this.appointments.listForAdmin()).map(toDto);
  }
}

export function toAdminAppointmentDto(
  appointment: AdminAppointmentRecord,
): AdminAppointmentDto {
  return toDto(appointment);
}

function toDto(appointment: AdminAppointmentRecord): AdminAppointmentDto {
  return {
    id: appointment.id,
    customerId: appointment.customerId,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    customerPhone: appointment.customerPhone,
    ownerName: appointment.ownerName,
    ownerEmail: appointment.ownerEmail,
    ownerPhone: appointment.ownerPhone,
    petId: appointment.petId,
    petName: appointment.petName,
    petWeightKg: appointment.petWeightKg,
    service: appointment.service,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    createdAt: appointment.createdAt.toISOString(),
    ...(appointment.notes ? { notes: appointment.notes } : {}),
  };
}
