import type { AuthResponseDto, AuthUserDto } from "@caninany/shared";
import { create } from "zustand";

import { decodeAccessToken } from "@/core/auth/jwt";

interface AuthState {
  accessToken: string | null;
  logout: () => void;
  setSession: (session: AuthResponseDto) => void;
  user: AuthUserDto | null;
}

function readStoredSession(): {
  accessToken: string | null;
  user: AuthUserDto | null;
} {
  const accessToken = localStorage.getItem("access_token");
  const serializedUser = localStorage.getItem("auth_user");
  const payload = accessToken ? decodeAccessToken(accessToken) : null;
  if (
    !accessToken ||
    !serializedUser ||
    !payload ||
    payload.exp * 1000 <= Date.now()
  ) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    return { accessToken: null, user: null };
  }

  try {
    const user = JSON.parse(serializedUser) as AuthUserDto;
    if (
      user.id !== payload.userId ||
      user.email !== payload.email ||
      user.role !== payload.role
    ) {
      throw new Error("Stored session does not match the access token.");
    }
    return {
      accessToken,
      user,
    };
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    return { accessToken: null, user: null };
  }
}

const storedSession = readStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storedSession.accessToken,
  user: storedSession.user,
  setSession: (session) => {
    localStorage.setItem("access_token", session.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(session.user));
    set({ accessToken: session.accessToken, user: session.user });
  },
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    set({ accessToken: null, user: null });
  },
}));
