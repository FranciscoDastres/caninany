export const APPOINTMENT_SERVICES = [
  "bath",
  "ear-cleaning",
  "bath-and-ear-cleaning",
] as const;

export type AppointmentService = (typeof APPOINTMENT_SERVICES)[number];

export interface AppointmentDto {
  id: string;
  customerId: string;
  petId: string;
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
