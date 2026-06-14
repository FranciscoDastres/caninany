import { ApiError } from "./http-client";

export function getApiErrorMessage(
  error: unknown,
  fallback = "No fue posible completar la solicitud.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}
