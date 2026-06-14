import type {
  AuthResponseDto,
  LoginInput,
  RegisterInput,
} from "@caninany/shared";

import { httpClient } from "@/core/api/http-client";

export async function login(input: LoginInput): Promise<AuthResponseDto> {
  const response = await httpClient.post<AuthResponseDto>("/auth/login", input);
  return response.data;
}

export async function register(input: RegisterInput): Promise<AuthResponseDto> {
  const response = await httpClient.post<AuthResponseDto>(
    "/auth/register",
    input,
  );
  return response.data;
}
