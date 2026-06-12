import type { Appointment } from "../entities/appointment.entity";

export const APPOINTMENT_REPOSITORY = Symbol("APPOINTMENT_REPOSITORY");

export interface AppointmentRepository {
  findBetween(startsAt: Date, endsAt: Date): Promise<Appointment[]>;
  findOverlapping(startsAt: Date, endsAt: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
}
