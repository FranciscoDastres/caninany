import type { JSX, PropsWithChildren } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-emerald-800"
          >
            <CalendarDays className="size-5" />
            Caninany
          </Link>
          <nav className="flex gap-5 text-sm text-slate-600">
            <Link to="/">Agendar</Link>
            <Link to="/admin">Administración</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
