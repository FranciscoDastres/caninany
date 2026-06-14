import { ShieldCheck } from "lucide-react";
import type { JSX } from "react";

import { useAuthStore } from "@/store/auth.store";

import { SiteContentEditor } from "./site-content-editor";
import { UserManagement } from "./user-management";

export function AdminDashboard(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="min-h-screen bg-[#eef2e8] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Administración</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-5xl text-[#183c2d]">
              Panel de gestión
            </h1>
            <p className="mt-3 text-[#66766e]">
              Administra usuarios y contenido público de Caninany.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm text-[#52665c] shadow-sm">
            <ShieldCheck className="size-5 text-[#b16d4b]" />
            <span>
              <strong>Administrador:</strong> {user?.name}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          <UserManagement />
          <SiteContentEditor />
        </div>
      </div>
    </section>
  );
}
