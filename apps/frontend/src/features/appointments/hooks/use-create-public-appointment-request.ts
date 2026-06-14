import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPublicAppointmentRequest } from "../api/appointments.api";

export function useCreatePublicAppointmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPublicAppointmentRequest,
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointment-calendar"],
      });
    },
  });
}
