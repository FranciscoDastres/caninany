import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "No fue posible completar la solicitud.",
): string {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;
  return typeof message === "string" ? message : fallback;
}
