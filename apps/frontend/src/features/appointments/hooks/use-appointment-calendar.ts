import { useQuery } from "@tanstack/react-query";

import {
  getAppointmentCalendar,
  type GetAppointmentCalendarParams,
} from "../api/appointments.api";

interface UseAppointmentCalendarOptions extends GetAppointmentCalendarParams {
  enabled: boolean;
}

export function useAppointmentCalendar({
  enabled,
  ...params
}: UseAppointmentCalendarOptions) {
  return useQuery({
    queryKey: [
      "appointment-calendar",
      params.month,
      params.service,
      params.petWeightKg,
    ],
    queryFn: () => getAppointmentCalendar(params),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}
