export const APPOINTMENT_SERVICES = [
  "bath",
  "ear-cleaning",
  "bath-and-ear-cleaning",
] as const;

export type AppointmentService = (typeof APPOINTMENT_SERVICES)[number];

export interface AppointmentDto {
  id: string;
  customerId: string | null;
  petId: string | null;
  petName?: string | null;
  service: AppointmentService;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export interface AvailableSlotsDto {
  date: string;
  slots: string[];
}

export type AppointmentSlotStatus = "available" | "occupied";

export interface AppointmentCalendarSlotDto {
  startsAt: string;
  endsAt: string;
  status: AppointmentSlotStatus;
}

export interface AppointmentBusyPeriodDto {
  startsAt: string;
  endsAt: string;
}

export interface AppointmentCalendarDayDto {
  date: string;
  isPast: boolean;
  availableCount: number;
  busyCount: number;
  slots: AppointmentCalendarSlotDto[];
  busyPeriods: AppointmentBusyPeriodDto[];
}

export interface AppointmentCalendarDto {
  month: string;
  timeZone: string;
  intervalMinutes: number;
  durationMinutes: number;
  days: AppointmentCalendarDayDto[];
}

export interface PublicAppointmentRequestDto {
  id: string;
  service: AppointmentService;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  status: "pending";
}
