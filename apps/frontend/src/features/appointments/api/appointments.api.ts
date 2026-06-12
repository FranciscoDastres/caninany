import type { AppointmentDto, CreateAppointmentInput } from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<AppointmentDto> {
  const response = await httpClient.post<AppointmentDto>(
    "/appointments",
    input,
  );
  return response.data;
}
