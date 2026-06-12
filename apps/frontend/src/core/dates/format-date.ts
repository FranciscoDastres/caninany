import { format } from "date-fns";

export function formatAppointmentDate(isoDate: string): string {
  return format(new Date(isoDate), "dd/MM/yyyy HH:mm");
}
