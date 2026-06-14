import type {
  AppointmentCalendarDto,
  AppointmentDto,
  AppointmentService,
  CreateAppointmentInput,
  CreatePublicAppointmentRequestInput,
  PublicAppointmentRequestDto,
} from "@caninany/shared";

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

export async function createPublicAppointmentRequest(
  input: CreatePublicAppointmentRequestInput,
): Promise<PublicAppointmentRequestDto> {
  const response = await httpClient.post<PublicAppointmentRequestDto>(
    "/appointments/requests",
    input,
  );
  return response.data;
}

export interface GetAppointmentCalendarParams {
  month: string;
  petWeightKg: number;
  service: AppointmentService;
}

export async function getAppointmentCalendar(
  params: GetAppointmentCalendarParams,
): Promise<AppointmentCalendarDto> {
  const response = await httpClient.get<AppointmentCalendarDto>(
    "/appointments/calendar",
    { params },
  );
  return response.data;
}
