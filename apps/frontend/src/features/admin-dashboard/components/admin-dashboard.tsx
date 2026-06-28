import { ShieldCheck } from "lucide-react";
import type { JSX } from "react";

import { useAuthStore } from "@/store/auth.store";

import { AppointmentManagement } from "./appointment-management";
import { SiteContentEditor } from "./site-content-editor";
import { UserManagement } from "./user-management";

export function AdminDashboard(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <section className="bg-brand-soft px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Administración</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl leading-[1.06] text-brand-deep sm:text-5xl">
              Panel de gestión
            </h1>
            <p className="mt-3 text-[#6b646d]">
              Administra usuarios y contenido público de Caninany.
            </p>
          </div>
          <div className="flex items-center gap-3 border border-brand-primary/10 bg-white px-5 py-3 text-sm text-[#625b64] shadow-sm">
            <ShieldCheck className="size-5 text-[#8f6291]" />
            <span>
              <strong>Administrador:</strong> {user?.name}
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-8">
          <AppointmentManagement />
          <UserManagement />
          <SiteContentEditor />
        </div>
      </div>
    </section>
  );
}
