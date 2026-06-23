import {
  ArrowRight,
  Clock3,
  Heart,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Clock3,
    title: "Tiempo que se adapta",
    text: "La duración considera el servicio y tamaño de cada mascota, sin trabajar en serie.",
  },
  {
    icon: Heart,
    title: "Señales que importan",
    text: "Observamos su carácter, sus miedos y la mejor forma de acompañarle durante la visita.",
  },
  {
    icon: ShieldCheck,
    title: "Cuidado transparente",
    text: "Explicamos el proceso, usamos rutinas suaves y confirmamos cada solicitud directamente.",
  },
];

export function AboutPage(): JSX.Element {
  return (
    <>
      <section className="bg-brand-deep text-white">
        <div className="site-container grid min-h-[640px] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-center py-16 pr-0 lg:pr-16">
            <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
              <PawPrint className="size-4" />
              Nosotros
            </p>
            <h1 className="display-title mt-7 text-white">
              Cuidamos con paciencia, atención y respeto.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#ded2e0]">
              En Caninany creemos que la higiene puede ser una experiencia más
              tranquila cuando cada mascota recibe tiempo, señales claras y un
              trato verdaderamente personalizado.
            </p>
            <Link
              to="/agendar"
              className="mt-9 inline-flex min-h-14 w-fit items-center gap-3 bg-brand-bright px-7 text-sm font-extrabold text-white transition hover:bg-[#b167b6]"
            >
              Reservar una visita
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative min-h-[390px] overflow-hidden lg:min-h-full">
            <img
              src="/images/happy-clients.webp"
              alt="Una clienta feliz junto a sus perros"
              className="absolute inset-0 size-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-brand-deep/25 lg:to-transparent" />
          </div>
        </div>
      </section>

      <section className="bg-brand-yellow px-5 py-12 text-center sm:px-8 sm:py-16">
        <p className="mx-auto max-w-5xl font-display text-2xl leading-tight text-brand-deep sm:text-3xl lg:text-[2.5rem]">
          Queremos que cada visita se sienta clara para su familia y segura para
          quien recibe el cuidado.
        </p>
      </section>

      <section className="section-pad bg-brand-cream">
        <div className="site-container grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div>
            <p className="section-kicker">Nuestro enfoque</p>
            <h2 className="section-title mt-5 text-brand-deep">
              Una forma más humana de cuidar.
            </h2>
          </div>
          <div>
            <p className="text-xl leading-9 text-[#514853]">
              No buscamos atender más rápido: buscamos atender mejor. Por eso la
              agenda considera el servicio y peso de cada perro, y el proceso se
              adapta a su edad, carácter y experiencias previas.
            </p>
            <p className="mt-6 leading-8 text-brand-muted">
              Nuestra propuesta se concentra en dos cuidados esenciales: baño
              completo y limpieza externa de oídos. Pueden reservarse por
              separado o reunirse en una sola visita.
            </p>
            <Link
              to="/#servicios"
              className="mt-8 inline-flex items-center gap-3 font-extrabold text-brand-primary"
            >
              Revisar los servicios
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="deferred-section bg-white py-14 lg:py-18"
        aria-labelledby="values-title"
      >
        <div className="site-container">
          <h2
            id="values-title"
            className="font-display text-3xl text-brand-deep sm:text-4xl"
          >
            Lo que guía cada visita
          </h2>
          <div className="mt-8 grid border-y border-[#e4dfe5] lg:grid-cols-3">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="border-b border-[#e4dfe5] py-9 lg:border-b-0 lg:border-r lg:px-10 lg:first:pl-0 lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <value.icon
                    className="size-7 text-brand-primary"
                    strokeWidth={1.6}
                  />
                  <span className="text-xs font-extrabold tracking-[0.16em] text-[#8f8791]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl text-brand-deep">
                  {value.title}
                </h3>
                <p className="mt-4 leading-7 text-brand-muted">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="deferred-section section-pad bg-brand-soft">
        <div className="site-container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Así se ve el cuidado</p>
              <h2 className="section-title mt-5 max-w-2xl text-brand-deep">
                Un equipo atento a los detalles.
              </h2>
            </div>
            <p className="max-w-lg leading-7 text-[#6b646d]">
              Nuestro trabajo combina observación, comunicación con la familia y
              un ambiente preparado para acompañar con calma.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-12 md:auto-rows-[250px]">
            <figure className="image-reveal md:col-span-7 md:row-span-2">
              <img
                src="/images/dog-bath.webp"
                alt="Perrito durante una sesión de baño cuidadosa"
                className="size-full object-cover"
                loading="lazy"
              />
            </figure>
            <figure className="image-reveal md:col-span-5">
              <img
                src="/images/ear-care.webp"
                alt="Limpieza externa de oídos realizada con atención"
                className="size-full object-cover"
                loading="lazy"
              />
            </figure>
            <div className="flex flex-col justify-between bg-brand-bright p-8 text-white md:col-span-5">
              <Sparkles className="size-7" />
              <p className="mt-8 font-display text-2xl leading-tight sm:text-3xl">
                Un proceso claro para su familia y respetuoso para su mascota.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-brand-cream text-center">
        <div className="site-container">
          <PawPrint className="mx-auto size-8 text-brand-primary" />
          <h2 className="section-title mx-auto mt-6 max-w-3xl text-brand-deep">
            ¿Listos para una visita más tranquila?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-brand-muted">
            Revisa la disponibilidad y solicita un horario compatible con el
            servicio y tamaño de tu mascota.
          </p>
          <Link
            to="/agendar"
            className="mt-8 inline-flex min-h-14 items-center gap-3 bg-brand-primary px-8 text-sm font-extrabold text-white transition hover:bg-brand-deep"
          >
            Ver agenda disponible
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
