import type { Appointment } from "../entities/appointment.entity";

export const APPOINTMENT_REPOSITORY = Symbol("APPOINTMENT_REPOSITORY");

export interface AppointmentBusyPeriod {
  endsAt: Date;
  startsAt: Date;
}

export interface AppointmentRepository {
  findBusyPeriods(
    startsAt: Date,
    endsAt: Date,
  ): Promise<AppointmentBusyPeriod[]>;
  hasActiveOverlap(startsAt: Date, endsAt: Date): Promise<boolean>;
  save(appointment: Appointment): Promise<void>;
}
