import type { Appointment } from "../entities/appointment.entity";

export class ScheduleConflictService {
  static hasConflict(
    startsAt: Date,
    durationMinutes: number,
    appointments: Appointment[],
  ): boolean {
    const endsAt = startsAt.getTime() + durationMinutes * 60_000;

    return appointments.some(
      (appointment) =>
        appointment.status !== "cancelled" &&
        startsAt.getTime() < appointment.endsAt.getTime() &&
        endsAt > appointment.startsAt.getTime(),
    );
  }
}
