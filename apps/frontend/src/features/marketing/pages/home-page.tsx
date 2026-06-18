import {
  ArrowRight,
  Bath,
  Check,
  Clock3,
  Ear,
  Heart,
  PawPrint,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import type { JSX } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { DeferredAppointmentForm } from "@/features/appointments/components/deferred-appointment-form";
import { useSiteConfiguration } from "@/features/site-configuration/hooks/use-site-configuration";

import { GallerySection } from "../components/gallery-section";

const services = [
  {
    icon: Bath,
    name: "Baño completo",
    description:
      "Shampoo suave, masaje, secado paciente y cepillado final según su tamaño.",
    detail: "45 a 90 min",
    color: "bg-[#dce8db]",
    iconColor: "text-[#315f49]",
  },
  {
    icon: Ear,
    name: "Limpieza de oídos",
    description:
      "Limpieza externa delicada para mantener sus oídos limpios y cómodos.",
    detail: "20 min aprox.",
    color: "bg-[#f4dfd1]",
    iconColor: "text-[#a65f40]",
  },
];

const reviews = [
  {
    quote:
      "Milo normalmente se pone nervioso, pero aquí salió relajado y precioso. Se nota el cariño.",
    name: "Camila & Milo",
    pet: "Poodle, 3 años",
  },
  {
    quote:
      "La reserva fue sencilla y me explicaron todo. Olivia quedó suave, limpia y feliz.",
    name: "Javiera & Olivia",
    pet: "Golden retriever, 5 años",
  },
  {
    quote:
      "Por fin un lugar donde no los atienden con prisa. La experiencia completa vale totalmente la pena.",
    name: "Tomás & Bruno",
    pet: "Cocker spaniel, 4 años",
  },
];

function BookingSection(): JSX.Element {
  return (
    <section
      id="reservar"
      className="deferred-section bg-[#d9865f] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="rounded-[1.5rem] border border-white/20 bg-[#c97752] p-5 text-white shadow-[0_24px_80px_rgba(94,45,24,0.16)] sm:rounded-[1.75rem] sm:p-8 lg:sticky lg:top-28">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#ffe2d2]">
            Reserva online
          </p>
          <h2 className="mt-4 font-display text-3xl leading-[1.08] sm:text-5xl">
            Agenda baño, oídos o el cuidado completo.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#fff0e7] sm:text-base sm:leading-7">
            Elige el servicio, cuéntanos el peso de tu mascota y revisa la
            agenda disponible. Te contactaremos por WhatsApp para confirmar.
          </p>

          <div className="mt-6 grid gap-2.5 text-sm font-bold sm:gap-3">
            {[
              { icon: Sparkles, text: "Baño + oídos disponible como combo" },
              { icon: Clock3, text: "Bloques calculados según peso y servicio" },
              { icon: Phone, text: "Confirmación directa por WhatsApp" },
            ].map((item) => (
              <p key={item.text} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 sm:size-9">
                  <item.icon className="size-4" />
                </span>
                {item.text}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[#fffaf3] p-5 shadow-[0_28px_80px_rgba(94,45,24,0.2)] sm:p-8">
          <DeferredAppointmentForm />
        </div>
      </div>
    </section>
  );
}

export function HomePage(): JSX.Element {
  const configuration = useSiteConfiguration();
  const content = configuration.data ?? {
    heroTitle: "Cuidado que se nota.",
    heroHighlight: "Cariño que se siente.",
    heroDescription:
      "Baño y limpieza de oídos en un espacio tranquilo, pensado para que tu perro se sienta seguro desde que llega hasta que vuelve contigo.",
    heroImageUrl: "/images/caninany-hero.webp",
    servicesEyebrow: "Servicios esenciales",
    servicesTitle: "Todo lo que necesita para sentirse increíble.",
    servicesDescription:
      "Una rutina simple, bien hecha y adaptada al tamaño de tu mascota.",
  };

  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return;

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView();
    });
  }, []);

  return (
    <>
      <section className="px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:pb-14">
        <div className="relative mx-auto min-h-[640px] max-w-[1500px] overflow-hidden rounded-[1.75rem] bg-[#e9e3d8] sm:min-h-[680px] sm:rounded-[2.5rem]">
          <img
            src={content.heroImageUrl}
            alt="Golden retriever feliz después de su baño"
            className="absolute inset-0 size-full object-cover object-[72%_center] sm:object-[62%_center]"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ef]/95 via-[#fff8ef]/82 to-[#fff8ef]/42 sm:bg-gradient-to-r sm:from-[#fff8ef] sm:via-[#fff8ef]/86 sm:to-[#fff8ef]/8" />
          <div className="absolute -left-16 bottom-[-7rem] hidden size-72 rounded-full border-[42px] border-[#d79570]/18 sm:block" />

          <div className="relative z-10 flex min-h-[640px] max-w-3xl flex-col justify-center px-6 py-14 sm:min-h-[680px] sm:px-12 lg:px-20">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#d9cec0] bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#345644] backdrop-blur">
              <PawPrint className="size-4 text-[#c27650]" />
              Baño y limpieza de oídos
            </div>
            <h1 className="font-display text-4xl leading-[1.03] text-[#183c2d] sm:text-6xl lg:text-[4.9rem]">
              {content.heroTitle}
              <span className="block text-[#b96f4b]">
                {content.heroHighlight}
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#52665c] sm:text-xl">
              {content.heroDescription}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#reservar"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#214e3b] px-7 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(33,78,59,0.25)] transition hover:-translate-y-1 hover:bg-[#173c2c]"
              >
                Reservar una visita
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#servicios"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#bfb6a9] bg-white/70 px-7 text-sm font-extrabold text-[#284a39] backdrop-blur transition hover:bg-white"
              >
                Ver servicios
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#5c6d64]">
              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#b96f4b]" />
                Atención sin apuros
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#b96f4b]" />
                Productos suaves
              </span>
              <span className="flex items-center gap-2">
                <Check className="size-4 text-[#b96f4b]" />
                Reserva simple
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="servicios"
        className="deferred-section px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{content.servicesEyebrow}</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.06] text-[#183c2d] sm:text-5xl">
              {content.servicesTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#6b7971]">
              {content.servicesDescription}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.name}
                className="group rounded-[1.5rem] border border-[#e5ddd2] bg-white p-6 shadow-[0_16px_50px_rgba(47,67,56,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(47,67,56,0.1)] sm:p-7"
              >
                <div
                  className={`grid size-14 place-items-center rounded-2xl ${service.color}`}
                >
                  <service.icon
                    className={`size-6 ${service.iconColor}`}
                    strokeWidth={1.8}
                  />
                </div>
                <div className="mt-7 flex items-start justify-between gap-5">
                  <div>
                    <h3 className="font-display text-2xl text-[#183c2d]">
                      {service.name}
                    </h3>
                    <p className="mt-4 leading-7 text-[#6d7b73]">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex items-center justify-between border-t border-[#eee7de] pt-5">
                  <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#b16d4b]">
                    {service.detail}
                  </span>
                  <a
                    href="#reservar"
                    className="grid size-11 place-items-center rounded-full bg-[#f2eee7] text-[#214e3b] transition group-hover:bg-[#214e3b] group-hover:text-white"
                    aria-label={`Reservar ${service.name}`}
                  >
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-5 flex max-w-5xl flex-col gap-4 rounded-[1.5rem] border border-[#ead8cc] bg-[#fff6f0] p-5 text-[#244435] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f1ddcf] text-[#b16d4b]">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="font-display text-xl leading-tight">
                  También puedes reservar el cuidado completo.
                </p>
                <p className="mt-1 text-sm leading-6 text-[#66766e]">
                  Baño + limpieza de oídos en una sola visita tranquila.
                </p>
              </div>
            </div>
            <a
              href="#reservar"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#214e3b] px-5 text-sm font-extrabold text-white"
            >
              Reservar combo
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <BookingSection />

      <section
        id="experiencia"
        className="deferred-section bg-[#eef2e8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative">
            <div className="image-reveal aspect-[4/5] overflow-hidden rounded-[2.5rem] sm:aspect-[5/4] lg:aspect-[4/5]">
              <img
                src="/images/dog-bath.webp"
                alt="Perrito disfrutando un baño cuidadoso"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-7 -right-3 max-w-[230px] rounded-[1.8rem] bg-[#d7865e] p-6 text-white shadow-xl sm:right-8">
              <Heart className="size-7 fill-white/15" />
              <p className="mt-4 font-display text-2xl leading-tight">
                Cada mascota marca el ritmo.
              </p>
            </div>
          </div>

          <div className="lg:pl-10">
            <p className="eyebrow">Una experiencia diferente</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.06] text-[#183c2d] sm:text-5xl">
              Menos estrés. Más confianza.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#64746b]">
              Observamos, escuchamos y adaptamos cada visita. No trabajamos en
              serie: trabajamos con paciencia para que el cuidado sea una
              experiencia positiva.
            </p>

            <div className="mt-9 grid gap-6">
              {[
                {
                  icon: Clock3,
                  title: "Tiempo dedicado",
                  text: "Bloques de atención según el servicio y su tamaño.",
                },
                {
                  icon: ShieldCheck,
                  title: "Ambiente seguro",
                  text: "Rutinas suaves, espacio limpio y acompañamiento constante.",
                },
                {
                  icon: Heart,
                  title: "Trato personalizado",
                  text: "Consideramos su edad, carácter y experiencias anteriores.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-[#b96f4b] shadow-sm">
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#28473a]">{item.title}</h3>
                    <p className="mt-1 leading-6 text-[#6c7b73]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#reservar"
              className="mt-10 inline-flex items-center gap-3 font-extrabold text-[#214e3b]"
            >
              Conversemos sobre tu mascota
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <GallerySection />

      <section
        id="opiniones"
        className="deferred-section px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="eyebrow">Lo dicen sus humanos</p>
              <h2 className="mt-5 font-display text-4xl leading-[1.06] text-[#183c2d] sm:text-5xl">
                Buenas experiencias dejan huella.
              </h2>
              <div className="mt-7 flex items-center gap-4">
                <div className="flex text-[#d47c4e]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-[#40574c]">4.9 de 5</span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {reviews.map((review, index) => (
                <article
                  key={review.name}
                  className={`rounded-[2rem] p-7 sm:p-8 ${
                    index === 0
                      ? "bg-[#f1e3d8] md:col-span-2"
                      : "border border-[#e7ded2] bg-white"
                  }`}
                >
                  <div className="flex text-[#d47c4e]">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="size-4 fill-current" />
                    ))}
                  </div>
                  <blockquote
                    className={`mt-6 font-display leading-tight text-[#244435] ${
                      index === 0 ? "text-2xl sm:text-3xl" : "text-xl"
                    }`}
                  >
                    “{review.quote}”
                  </blockquote>
                  <div className="mt-7 flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-[#214e3b] text-white">
                      <PawPrint className="size-5" />
                    </span>
                    <div>
                      <p className="font-bold text-[#29483a]">{review.name}</p>
                      <p className="text-sm text-[#75827b]">{review.pet}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#122e22] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 border-b border-white/10 pb-10 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#d9865f]">
                <PawPrint className="size-5" />
              </span>
              <span>
                <span className="block font-display text-3xl leading-none">
                  Caninany
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-[#9db2a7]">
                  Baño y oídos
                </span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#b8c8bf]">
              <a href="#servicios">Servicios</a>
              <a href="#experiencia">Experiencia</a>
              <a href="#galeria">Galería</a>
              <a href="#reservar">Reservar</a>
              <Link to="/ingresar">Acceso usuarios</Link>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-7 text-xs text-[#82988d] sm:flex-row sm:justify-between">
            <p>© 2026 Caninany. Cuidado hecho con paciencia.</p>
            <p>Baño · Limpieza de oídos · Bienestar</p>
          </div>
        </div>
      </footer>
    </>
  );
}
