import { LogOut, Menu, PawPrint, UserRound, X } from "lucide-react";
import type { JSX, PropsWithChildren } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const closeMenu = (): void => setMenuOpen(false);
  const logoutAndReturnHome = (): void => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf3] text-[#1d2b24]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-[#fffaf3]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
            onClick={closeMenu}
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-[#214e3b] text-white shadow-[0_8px_24px_rgba(33,78,59,0.2)] transition-transform group-hover:-rotate-6">
              <PawPrint className="size-5" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block font-display text-2xl leading-none text-[#183c2d]">
                Caninany
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#b16d4b]">
                Baño y oídos
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#496057] lg:flex">
            <a className="nav-link" href="#servicios">
              Servicios
            </a>
            <a className="nav-link" href="#experiencia">
              Experiencia
            </a>
            <a className="nav-link" href="#galeria">
              Galería
            </a>
            <a className="nav-link" href="#opiniones">
              Opiniones
            </a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/perfil"}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d8d0c5] bg-white px-4 text-sm font-bold text-[#214e3b]"
                >
                  <UserRound className="size-4" />
                  {user.role === "admin" ? "Administración" : "Mi perfil"}
                </Link>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full border border-[#d8d0c5] bg-white text-[#214e3b]"
                  aria-label="Cerrar sesión"
                  onClick={logoutAndReturnHome}
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <Link
                to="/ingresar"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d0c5] bg-white px-5 text-sm font-bold text-[#214e3b]"
              >
                Ingresar
              </Link>
            )}
            <a
              href="#reservar"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#214e3b] px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(33,78,59,0.22)] transition hover:-translate-y-0.5 hover:bg-[#183c2d]"
            >
              Reservar una hora
            </a>
          </div>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-[#dcd6cb] bg-white text-[#214e3b] sm:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen ? (
          <nav className="border-t border-[#e8dfd2] bg-[#fffaf3] px-5 py-5 sm:hidden">
            <div className="grid gap-1 text-base font-semibold text-[#30473d]">
              <a
                className="rounded-2xl px-4 py-3 hover:bg-white"
                href="#servicios"
                onClick={closeMenu}
              >
                Servicios
              </a>
              <a
                className="rounded-2xl px-4 py-3 hover:bg-white"
                href="#experiencia"
                onClick={closeMenu}
              >
                Experiencia
              </a>
              <a
                className="rounded-2xl px-4 py-3 hover:bg-white"
                href="#galeria"
                onClick={closeMenu}
              >
                Galería
              </a>
              <a
                className="rounded-2xl px-4 py-3 hover:bg-white"
                href="#opiniones"
                onClick={closeMenu}
              >
                Opiniones
              </a>
              <a
                className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[#214e3b] px-6 text-sm font-bold text-white"
                href="#reservar"
                onClick={closeMenu}
              >
                Reservar una hora
              </a>
              {user ? (
                <>
                  <Link
                    className="mt-2 rounded-2xl bg-white px-4 py-3 text-center"
                    to={user.role === "admin" ? "/admin" : "/perfil"}
                    onClick={closeMenu}
                  >
                    {user.role === "admin" ? "Administración" : "Mi perfil"}
                  </Link>
                  <button
                    type="button"
                    className="rounded-2xl px-4 py-3 text-left text-[#9a4f34]"
                    onClick={logoutAndReturnHome}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  className="mt-2 rounded-2xl bg-white px-4 py-3 text-center"
                  to="/ingresar"
                  onClick={closeMenu}
                >
                  Ingresar
                </Link>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <main>{children}</main>
    </div>
  );
}
