import { create } from "zustand";

interface AuthUser {
  id: string;
  name: string;
  role: "admin" | "client";
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
