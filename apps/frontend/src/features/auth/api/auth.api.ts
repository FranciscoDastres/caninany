import type {
  AuthResponseDto,
  AuthSessionDto,
  EmailActionInput,
  GoogleCredentialInput,
  GoogleLinkInput,
  LoginInput,
  MessageResponseDto,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@caninany/shared";

import { httpClient, renewAuthSession } from "@/core/api/http-client";

export async function login(input: LoginInput): Promise<AuthResponseDto> {
  const response = await httpClient.post<AuthResponseDto>("/auth/login", input);
  return response.data;
}

export async function loginWithGoogle(
  input: GoogleCredentialInput,
): Promise<AuthResponseDto> {
  const response = await httpClient.post<AuthResponseDto>(
    "/auth/google",
    input,
  );
  return response.data;
}

export async function linkGoogle(
  input: GoogleLinkInput,
): Promise<AuthResponseDto> {
  const response = await httpClient.post<AuthResponseDto>(
    "/auth/google/link",
    input,
  );
  return response.data;
}

export async function register(
  input: RegisterInput,
): Promise<MessageResponseDto> {
  const response = await httpClient.post<MessageResponseDto>(
    "/auth/register",
    input,
  );
  return response.data;
}

export async function verifyEmail(
  input: VerifyEmailInput,
): Promise<MessageResponseDto> {
  const response = await httpClient.post<MessageResponseDto>(
    "/auth/verify-email",
    input,
  );
  return response.data;
}

export async function resendVerification(
  input: EmailActionInput,
): Promise<MessageResponseDto> {
  const response = await httpClient.post<MessageResponseDto>(
    "/auth/resend-verification",
    input,
  );
  return response.data;
}

export async function forgotPassword(
  input: EmailActionInput,
): Promise<MessageResponseDto> {
  const response = await httpClient.post<MessageResponseDto>(
    "/auth/forgot-password",
    input,
  );
  return response.data;
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<MessageResponseDto> {
  const response = await httpClient.post<MessageResponseDto>(
    "/auth/reset-password",
    input,
  );
  return response.data;
}

export function bootstrapSession(): Promise<AuthResponseDto> {
  return renewAuthSession();
}

export async function logout(): Promise<void> {
  await httpClient.post<void>("/auth/logout");
}

export async function logoutAll(): Promise<void> {
  await httpClient.post<void>("/auth/logout-all");
}

export async function getSessions(): Promise<AuthSessionDto[]> {
  const response = await httpClient.get<AuthSessionDto[]>("/auth/sessions");
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await httpClient.delete<void>(`/auth/sessions/${sessionId}`);
}

export async function unlinkGoogle(): Promise<MessageResponseDto> {
  const response = await httpClient.delete<MessageResponseDto>("/auth/google");
  return response.data;
}
