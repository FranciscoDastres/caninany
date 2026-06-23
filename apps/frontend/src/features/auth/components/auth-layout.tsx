import { Check, PawPrint } from "lucide-react";
import type { JSX, PropsWithChildren } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps extends PropsWithChildren {
  description: string;
  eyebrow: string;
  title: string;
}

export function AuthLayout({
  children,
  description,
  eyebrow,
  title,
}: AuthLayoutProps): JSX.Element {
  return (
    <section className="bg-brand-soft px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-6xl overflow-hidden bg-white shadow-[0_24px_80px_rgba(116,71,118,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative hidden min-h-[660px] overflow-hidden text-white lg:flex lg:flex-col lg:justify-between">
          <img
            src="/images/ear-care.webp"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-brand-deep/15" />
          <div className="relative flex items-center gap-3 p-12">
            <span className="grid size-12 place-items-center bg-brand-bright">
              <PawPrint className="size-5" />
            </span>
            <span className="font-display text-3xl">Caninany</span>
          </div>
          <div className="relative p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-yellow">
              Tu espacio Caninany
            </p>
            <p className="mt-5 font-display text-4xl leading-tight">
              Tus mascotas y cuidados, siempre ordenados.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-bold text-[#eadfed]">
              {[
                "Gestiona tus mascotas",
                "Revisa tus compras",
                "Acceso protegido",
              ].map((item) => (
                <p key={item} className="flex items-center gap-3">
                  <Check className="size-4 text-brand-yellow" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-11 lg:p-14">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-extrabold text-brand-primary lg:hidden"
          >
            <PawPrint className="size-4" />
            Volver a Caninany
          </Link>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-brand-deep sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 leading-7 text-brand-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
