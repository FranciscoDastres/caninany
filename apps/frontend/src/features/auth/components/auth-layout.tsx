import { PawPrint } from "lucide-react";
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
    <section className="min-h-screen bg-[#eef2e8] px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-[0_24px_80px_rgba(35,67,52,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="hidden bg-[#183c2d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#d9865f]">
              <PawPrint className="size-5" />
            </span>
            <span className="font-display text-3xl">Caninany</span>
          </Link>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#e1a985]">
              Tu espacio Caninany
            </p>
            <p className="mt-5 font-display text-4xl leading-tight">
              Tus compras, comprobantes y cuidados en un solo lugar.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-14">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[#183c2d] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 leading-7 text-[#66766e]">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
