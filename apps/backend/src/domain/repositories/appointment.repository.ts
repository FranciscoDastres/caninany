import type { AppointmentService } from "@caninany/shared";

import type {
  Appointment,
  AppointmentStatus,
} from "../entities/appointment.entity";

export const APPOINTMENT_REPOSITORY = Symbol("APPOINTMENT_REPOSITORY");

export interface AppointmentBusyPeriod {
  endsAt: Date;
  startsAt: Date;
}

export interface CustomerAppointmentRecord {
  customerId: string | null;
  durationMinutes: number;
  endsAt: Date;
  id: string;
  notes: string | null;
  petId: string | null;
  petName: string | null;
  service: AppointmentService;
  startsAt: Date;
  status: AppointmentStatus;
}

export interface AppointmentRepository {
  findBusyPeriods(
    startsAt: Date,
    endsAt: Date,
  ): Promise<AppointmentBusyPeriod[]>;
  hasActiveOverlap(startsAt: Date, endsAt: Date): Promise<boolean>;
  listByCustomer(customerId: string): Promise<CustomerAppointmentRecord[]>;
  save(appointment: Appointment): Promise<void>;
}
