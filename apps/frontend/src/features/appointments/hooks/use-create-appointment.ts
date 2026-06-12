import { useMutation } from "@tanstack/react-query";

import { createAppointment } from "../api/appointments.api";

export function useCreateAppointment() {
  return useMutation({
    mutationFn: createAppointment,
  });
}
