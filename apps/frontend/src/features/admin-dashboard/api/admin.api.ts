import type {
  AdminAppointmentDto,
  AppointmentStatus,
  SiteConfigurationDto,
  UpdateSiteConfigurationInput,
  UploadedImageDto,
  UserRole,
  UserSummaryDto,
} from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function getUsers(): Promise<UserSummaryDto[]> {
  const response = await httpClient.get<UserSummaryDto[]>("/usuarios");
  return response.data;
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<UserSummaryDto> {
  const response = await httpClient.patch<UserSummaryDto>(
    `/usuarios/${userId}/rol`,
    { role },
  );
  return response.data;
}

export async function getAdminAppointments(): Promise<AdminAppointmentDto[]> {
  const response = await httpClient.get<AdminAppointmentDto[]>(
    "/appointments/admin",
  );
  return response.data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<AdminAppointmentDto> {
  const response = await httpClient.patch<AdminAppointmentDto>(
    `/appointments/admin/${appointmentId}/status`,
    { status },
  );
  return response.data;
}

export async function updateSiteConfiguration(
  input: UpdateSiteConfigurationInput,
): Promise<SiteConfigurationDto> {
  const response = await httpClient.put<SiteConfigurationDto>(
    "/configuracion-sitio",
    input,
  );
  return response.data;
}

export async function uploadSiteImage(file: File): Promise<UploadedImageDto> {
  const formData = new FormData();
  formData.append("imagen", file);
  const response = await httpClient.post<UploadedImageDto>(
    "/configuracion-sitio/imagenes",
    formData,
  );
  return response.data;
}
