const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"
).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 10_000;

interface RequestConfig {
  headers?: Record<string, string>;
  params?: object;
}

interface HttpResponse<T> {
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config: RequestConfig = {},
  allowRefresh = true,
): Promise<HttpResponse<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );
  const headers = new Headers(config.headers);
  const accessToken = useAuthStore.getState().accessToken;
  const isFormData = body instanceof FormData;

  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (isFormData) headers.delete("Content-Type");

  try {
    const response = await fetch(buildUrl(path, config.params), {
      credentials: "include",
      method,
      headers,
      signal: controller.signal,
      ...(body === undefined
        ? {}
        : { body: isFormData ? body : JSON.stringify(body) }),
    });
    const data = await parseResponse(response);

    if (
      response.status === 401 &&
      allowRefresh &&
      accessToken &&
      path !== "/auth/refresh"
    ) {
      try {
        await renewAuthSession();
        return request<T>(method, path, body, config, false);
      } catch {
        useAuthStore.getState().clearSession();
      }
    }

    if (!response.ok) {
      const message =
        isMessageResponse(data) && typeof data.message === "string"
          ? data.message
          : `La solicitud falló con estado ${response.status}.`;
      throw new ApiError(message, response.status, data);
    }

    return { data: data as T };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La solicitud tardó demasiado.", 0, null);
    }
    throw new ApiError("No fue posible conectar con el servidor.", 0, null);
  } finally {
    window.clearTimeout(timeout);
  }
}

let refreshPromise: Promise<AuthResponseDto> | null = null;

export function renewAuthSession(): Promise<AuthResponseDto> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await parseResponse(response);
    if (!response.ok) {
      const message =
        isMessageResponse(data) && typeof data.message === "string"
          ? data.message
          : "No existe una sesión activa.";
      throw new ApiError(message, response.status, data);
    }

    const session = data as AuthResponseDto;
    useAuthStore.getState().setSession(session);
    return session;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function buildUrl(path: string, params?: object): string {
  const url = new URL(`${API_URL}${path}`, window.location.origin);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<unknown>;
  }

  const text = await response.text();
  return text || undefined;
}

function isMessageResponse(value: unknown): value is { message?: unknown } {
  return typeof value === "object" && value !== null;
}

export const httpClient = {
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>("DELETE", path, undefined, config),
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>("GET", path, undefined, config),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PATCH", path, body, config),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("POST", path, body, config),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PUT", path, body, config),
};
import type { AuthResponseDto } from "@caninany/shared";

import { useAuthStore } from "@/store/auth.store";
