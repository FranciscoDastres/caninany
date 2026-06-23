import {
  ArrowRight,
  CalendarDays,
  LogOut,
  Menu,
  MessageCircle,
  PawPrint,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { JSX, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import { logout } from "@/features/auth/api/auth.api";

const primaryLinks = [
  { label: "Servicios", to: "/#servicios" },
  { label: "Cómo trabajamos", to: "/#experiencia" },
  { label: "Galería", to: "/#galeria" },
  { label: "Opiniones", to: "/#opiniones" },
];

const secondaryLinks = [
  { label: "Inicio", to: "/" },
  ...primaryLinks,
  { label: "Nosotros", to: "/nosotros" },
];

const pageTitles: Record<string, string> = {
  "/": "Caninany | Baño y limpieza de oídos",
  "/nosotros": "Nosotros | Caninany",
  "/agendar": "Reservar una hora | Caninany",
  "/ingresar": "Ingresar | Caninany",
  "/registro": "Crear cuenta | Caninany",
  "/perfil": "Mi perfil | Caninany",
  "/admin": "Administración | Caninany",
};

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );

  const closeMenu = (): void => setMenuOpen(false);
  const logoutAndReturnHome = async (): Promise<void> => {
    try {
      await logout();
    } finally {
      clearSession();
    }
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    closeMenu();
    document.title = pageTitles[location.pathname] ?? "Caninany";

    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0 });
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMenuLinkRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-ink">
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido
      </a>

      <header className="sticky inset-x-0 top-0 z-50 bg-brand-cream shadow-[0_4px_24px_rgba(116,71,118,0.08)]">
        <div className="bg-brand-bright px-4 py-2 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-white sm:text-xs">
          Atención con reserva <span className="mx-2 text-brand-yellow">•</span>
          Baño y limpieza de oídos
        </div>

        <div className="site-container flex h-[4.75rem] items-center justify-between gap-6 lg:h-[5.5rem]">
          <BrandLink onClick={closeMenu} />

          <nav
            className="hidden items-center gap-7 text-sm font-bold text-[#514853] xl:flex"
            aria-label="Navegación principal"
          >
            {primaryLinks.map((link) => (
              <Link key={link.to} className="nav-link" to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/perfil"}
                  className="inline-flex min-h-11 items-center gap-2 border border-[#d9d4da] bg-white px-4 text-sm font-extrabold text-brand-primary transition hover:border-brand-primary"
                >
                  <UserRound className="size-4" />
                  <span className="hidden lg:inline">
                    {user.role === "admin" ? "Administración" : "Mi perfil"}
                  </span>
                </Link>
                <button
                  type="button"
                  className="grid size-11 place-items-center border border-[#d9d4da] bg-white text-brand-primary transition hover:border-brand-primary"
                  aria-label="Cerrar sesión"
                  onClick={logoutAndReturnHome}
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <Link
                to="/ingresar"
                className="grid size-11 place-items-center border border-[#d9d4da] bg-white text-brand-primary transition hover:border-brand-primary lg:inline-flex lg:w-auto lg:gap-2 lg:px-4 lg:text-sm lg:font-extrabold"
                aria-label="Ingresar"
              >
                <UserRound className="size-4" />
                <span className="hidden lg:inline">Ingresar</span>
              </Link>
            )}
            <Link
              to="/agendar"
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-brand-bright px-5 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(143,98,145,0.22)] transition hover:bg-brand-primary"
            >
              Reservar
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="grid size-11 place-items-center border border-[#d9d4da] bg-white text-brand-primary sm:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="menu-movil"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <nav
          className="hidden border-t border-white/15 bg-brand-primary lg:block"
          aria-label="Secciones del sitio"
        >
          <div className="site-container flex h-11 items-center justify-center gap-9 text-xs font-extrabold uppercase tracking-[0.1em] text-white">
            {secondaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition hover:text-brand-deep"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {menuOpen ? (
          <nav
            id="menu-movil"
            className="absolute inset-x-0 top-full max-h-[calc(100vh-6rem)] overflow-y-auto border-t border-[#e4dde5] bg-brand-cream px-5 py-5 shadow-xl sm:hidden"
            aria-label="Menú móvil"
          >
            <div className="grid gap-1 text-base font-bold text-brand-deep">
              {secondaryLinks.map((link, index) => (
                <Link
                  key={link.to}
                  ref={index === 0 ? firstMenuLinkRef : undefined}
                  className="border-b border-[#eee9ef] px-2 py-3.5"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 bg-brand-bright px-6 text-sm font-extrabold text-white"
                to="/agendar"
              >
                <CalendarDays className="size-4" />
                Reservar una hora
              </Link>
              {user ? (
                <>
                  <Link
                    className="mt-1 border border-[#d9d4da] bg-white px-4 py-3 text-center text-sm"
                    to={user.role === "admin" ? "/admin" : "/perfil"}
                  >
                    {user.role === "admin" ? "Administración" : "Mi perfil"}
                  </Link>
                  <button
                    type="button"
                    className="px-4 py-3 text-left text-sm text-[#8f6291]"
                    onClick={logoutAndReturnHome}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  className="mt-1 border border-[#d9d4da] bg-white px-4 py-3 text-center text-sm"
                  to="/ingresar"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </nav>
        ) : null}
      </header>

      <main id="contenido-principal">{children}</main>

      <ContactStrip whatsappNumber={whatsappNumber} />
      <SiteFooter whatsappNumber={whatsappNumber} />
    </div>
  );
}

function BrandLink({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-3"
      onClick={onClick}
    >
      <span className="grid size-11 place-items-center bg-brand-primary text-white transition group-hover:-rotate-3">
        <PawPrint className="size-5" strokeWidth={2.1} />
      </span>
      <span>
        <span className="block font-display text-2xl leading-none text-brand-deep lg:text-[1.7rem]">
          Caninany
        </span>
        <span className="mt-1 block text-[0.58rem] font-extrabold uppercase tracking-[0.22em] text-brand-primary">
          Baño y oídos
        </span>
      </span>
    </Link>
  );
}

function ContactStrip({
  whatsappNumber,
}: {
  whatsappNumber: string | undefined;
}): JSX.Element {
  const items = [
    {
      icon: Sparkles,
      title: "Conócenos",
      description: "Cuidado paciente y personalizado",
      to: "/nosotros",
    },
    {
      icon: MessageCircle,
      title: whatsappNumber ? "Conversemos" : "Nuestros servicios",
      description: whatsappNumber
        ? "Escríbenos por WhatsApp"
        : "Baño y limpieza de oídos",
      to: whatsappNumber ? `https://wa.me/${whatsappNumber}` : "/#servicios",
      external: Boolean(whatsappNumber),
    },
    {
      icon: CalendarDays,
      title: "Reserva online",
      description: "Revisa la disponibilidad real",
      to: "/agendar",
    },
  ];

  return (
    <aside className="bg-brand-yellow" aria-label="Accesos rápidos">
      <div className="site-container grid md:grid-cols-3">
        {items.map((item) => {
          const content = (
            <>
              <item.icon className="size-6 text-brand-deep" strokeWidth={1.7} />
              <span>
                <span className="block text-sm font-extrabold uppercase tracking-[0.06em] text-brand-deep">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm text-[#5c4b21]">
                  {item.description}
                </span>
              </span>
            </>
          );

          return item.external ? (
            <a
              key={item.title}
              href={item.to}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-28 items-center justify-center gap-4 border-b border-[#d5a327] px-5 py-6 text-center transition hover:bg-white/20 md:border-b-0 md:border-r last:border-0"
            >
              {content}
            </a>
          ) : (
            <Link
              key={item.title}
              to={item.to}
              className="flex min-h-28 items-center justify-center gap-4 border-b border-[#d5a327] px-5 py-6 text-center transition hover:bg-white/20 md:border-b-0 md:border-r last:border-0"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function SiteFooter({
  whatsappNumber,
}: {
  whatsappNumber: string | undefined;
}): JSX.Element {
  return (
    <footer className="bg-brand-primary px-5 py-14 text-white sm:px-8 lg:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/12 pb-12 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center bg-brand-bright">
                <PawPrint className="size-5" />
              </span>
              <span className="font-display text-3xl">Caninany</span>
            </div>
            <p className="mt-6 text-sm leading-7 text-[#d8c9da]">
              Baño y limpieza de oídos con tiempo, productos suaves y una
              atención adaptada al ritmo de cada mascota.
            </p>
          </div>

          <FooterColumn
            title="Explora"
            links={[
              { label: "Inicio", to: "/" },
              { label: "Nosotros", to: "/nosotros" },
              { label: "Galería", to: "/#galeria" },
              { label: "Opiniones", to: "/#opiniones" },
            ]}
          />
          <FooterColumn
            title="Servicios"
            links={[
              { label: "Baño completo", to: "/#servicios" },
              { label: "Limpieza de oídos", to: "/#servicios" },
              { label: "Cuidado completo", to: "/#servicios" },
              { label: "Reservar una hora", to: "/agendar" },
            ]}
          />
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-yellow">
              Tu cuenta
            </h2>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-[#d8c9da]">
              <Link to="/ingresar" className="hover:text-white">
                Ingresar
              </Link>
              <Link to="/registro" className="hover:text-white">
                Crear cuenta
              </Link>
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-7 text-xs text-[#bea9c0] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Caninany. Todos los derechos
            reservados.
          </p>
          <p>Baño · Limpieza de oídos · Bienestar</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  links,
  title,
}: {
  links: Array<{ label: string; to: string }>;
  title: string;
}): JSX.Element {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-yellow">
        {title}
      </h2>
      <div className="mt-5 grid gap-3 text-sm font-semibold text-[#d8c9da]">
        {links.map((link) => (
          <Link
            key={`${link.label}-${link.to}`}
            to={link.to}
            className="hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
