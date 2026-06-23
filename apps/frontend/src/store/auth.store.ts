import type { AuthResponseDto, AuthUserDto } from "@caninany/shared";
import { create } from "zustand";

export type AuthStatus = "authenticated" | "anonymous" | "initializing";

interface AuthState {
  accessToken: string | null;
  clearSession: () => void;
  setSession: (session: AuthResponseDto) => void;
  status: AuthStatus;
  user: AuthUserDto | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  status: "initializing",
  user: null,
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      status: "authenticated",
      user: session.user,
    }),
  clearSession: () =>
    set({ accessToken: null, status: "anonymous", user: null }),
}));
