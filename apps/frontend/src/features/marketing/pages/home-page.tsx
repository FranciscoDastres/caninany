import {
  ArrowRight,
  Bath,
  Check,
  Clock3,
  Ear,
  Heart,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

import { DeferredAppointmentForm } from "@/features/appointments/components/deferred-appointment-form";
import { useSiteConfiguration } from "@/features/site-configuration/hooks/use-site-configuration";

import { GallerySection } from "../components/gallery-section";

const services = [
  {
    icon: Bath,
    index: "01",
    name: "Baño completo",
    description:
      "Shampoo suave, masaje, secado paciente y cepillado final según su tamaño.",
    detail: "45 a 90 min",
    image: "/images/dog-bath.webp",
  },
  {
    icon: Ear,
    index: "02",
    name: "Limpieza de oídos",
    description:
      "Limpieza externa delicada para mantener sus oídos limpios y cómodos.",
    detail: "20 min aprox.",
    image: "/images/ear-care.webp",
  },
  {
    icon: Sparkles,
    index: "03",
    name: "Cuidado completo",
    description:
      "Baño y limpieza externa de oídos en una sola visita tranquila y coordinada.",
    detail: "Duración según peso",
    image: "/images/caninany-hero.webp",
  },
];

const trustPoints = [
  {
    icon: Clock3,
    title: "Atención sin apuros",
    text: "Cada bloque considera el servicio y tamaño de tu mascota.",
  },
  {
    icon: Heart,
    title: "Trato personalizado",
    text: "Observamos su carácter y adaptamos el ritmo de la visita.",
  },
  {
    icon: ShieldCheck,
    title: "Ambiente seguro",
    text: "Espacio limpio, rutinas suaves y acompañamiento constante.",
  },
  {
    icon: Check,
    title: "Reserva clara",
    text: "Disponibilidad real y confirmación directa del equipo.",
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

  return (
    <>
      <HeroSection content={content} />

      <section className="bg-brand-yellow px-5 py-12 text-center sm:px-8 sm:py-16">
        <p className="mx-auto max-w-5xl font-display text-2xl leading-tight text-brand-deep sm:text-3xl lg:text-[2.55rem]">
          Nuestro propósito es simple: cuidar con paciencia para que cada
          mascota viva su visita con más calma, confianza y bienestar.
        </p>
      </section>

      <ServicesSection
        eyebrow={content.servicesEyebrow}
        title={content.servicesTitle}
        description={content.servicesDescription}
      />

      <TrustSection />
      <ExperienceSection />
      <AboutTeaser />
      <GallerySection />
      <ReviewsSection />
      <BookingSection />
    </>
  );
}

interface HeroContent {
  heroDescription: string;
  heroHighlight: string;
  heroImageUrl: string;
  heroTitle: string;
}

function HeroSection({ content }: { content: HeroContent }): JSX.Element {
  return (
    <section className="relative min-h-[670px] overflow-hidden bg-brand-deep text-white lg:min-h-[720px]">
      <img
        src={content.heroImageUrl}
        alt="Golden retriever feliz después de su baño en Caninany"
        className="absolute inset-0 size-full object-cover object-[68%_center] sm:object-[62%_center] lg:object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(74,43,77,0.98)_0%,rgba(74,43,77,0.88)_36%,rgba(74,43,77,0.25)_76%,rgba(74,43,77,0.08)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/50 via-transparent to-transparent lg:hidden" />

      <div className="site-container relative flex min-h-[670px] items-center py-16 lg:min-h-[720px]">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#ffe7a3]">
            <PawPrint className="size-4" />
            Bienestar e higiene canina
          </p>
          <h1 className="display-title mt-7 max-w-3xl">
            {content.heroTitle}
            <span className="mt-2 block text-[#ffc63d]">
              {content.heroHighlight}
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#eadfed] sm:text-lg">
            {content.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/agendar"
              className="group inline-flex min-h-14 items-center justify-center gap-3 bg-brand-bright px-7 text-sm font-extrabold text-white shadow-[0_14px_35px_rgba(0,0,0,0.22)] transition hover:bg-[#b167b6]"
            >
              Reservar una hora
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/#servicios"
              className="inline-flex min-h-14 items-center justify-center border border-white/45 bg-white/8 px-7 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white hover:text-brand-deep"
            >
              Conocer los servicios
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 border-t border-white/18 pt-6 text-sm font-bold text-[#eadfed] sm:grid-cols-3">
            {["Atención sin apuros", "Productos suaves", "Reserva simple"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-brand-yellow" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}): JSX.Element {
  return (
    <section id="servicios" className="section-pad bg-brand-cream">
      <div className="site-container">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="section-kicker">{eyebrow}</p>
            <h2 className="section-title mt-5 max-w-xl text-brand-deep">
              {title}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-brand-muted lg:justify-self-end">
            {description} Puedes elegir un servicio puntual o reunir ambos en
            una sola visita.
          </p>
        </div>

        <div className="mt-14 border-y border-[#e4dfe5]">
          {services.map((service) => (
            <article
              key={service.name}
              className="group grid gap-6 border-b border-[#e4dfe5] py-8 last:border-0 md:grid-cols-[5rem_1fr_15rem] md:items-center lg:grid-cols-[6rem_1fr_18rem] lg:py-10"
            >
              <div className="flex items-center gap-4 md:block">
                <span className="text-xs font-extrabold tracking-[0.16em] text-brand-primary">
                  {service.index}
                </span>
                <span className="mt-3 grid size-12 place-items-center bg-brand-soft text-brand-primary md:size-14">
                  <service.icon className="size-6" strokeWidth={1.7} />
                </span>
              </div>
              <div>
                <h3 className="font-display text-3xl text-brand-deep sm:text-4xl">
                  {service.name}
                </h3>
                <p className="mt-3 max-w-2xl leading-7 text-brand-muted">
                  {service.description}
                </p>
                <span className="mt-4 inline-block text-xs font-extrabold uppercase tracking-[0.14em] text-brand-primary">
                  {service.detail}
                </span>
              </div>
              <div className="relative h-44 overflow-hidden md:h-36">
                <img
                  src={service.image}
                  alt=""
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <Link
                  to="/agendar"
                  className="absolute bottom-0 right-0 grid size-12 place-items-center bg-brand-bright text-white transition group-hover:bg-brand-deep"
                  aria-label={`Reservar ${service.name}`}
                >
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection(): JSX.Element {
  return (
    <section
      className="deferred-section bg-white py-14 lg:py-18"
      aria-labelledby="confianza-title"
    >
      <div className="site-container">
        <div className="flex flex-col gap-4 border-b border-[#e4dfe5] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="confianza-title"
            className="font-display text-3xl text-brand-deep sm:text-4xl"
          >
            Por qué confiar en Caninany
          </h2>
          <p className="text-sm text-brand-muted">
            Una atención simple, clara y respetuosa.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((item) => (
            <article
              key={item.title}
              className="border-b border-[#e4dfe5] px-0 py-8 md:px-7 md:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <item.icon
                className="size-7 text-brand-primary"
                strokeWidth={1.6}
              />
              <h3 className="mt-5 text-sm font-extrabold uppercase tracking-[0.05em] text-brand-deep">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-brand-muted">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSection(): JSX.Element {
  return (
    <section
      id="experiencia"
      className="deferred-section section-pad bg-brand-soft"
    >
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
        <div className="relative">
          <div className="image-reveal aspect-[4/5] overflow-hidden sm:aspect-[6/5] lg:aspect-[4/5]">
            <img
              src="/images/dog-bath.webp"
              alt="Perrito disfrutando un baño cuidadoso"
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-6 right-0 w-[min(78%,22rem)] bg-brand-bright p-6 text-white shadow-xl sm:p-8 lg:-right-8">
            <Heart className="size-7" strokeWidth={1.7} />
            <p className="mt-4 font-display text-2xl leading-tight sm:text-3xl">
              Cada mascota marca el ritmo.
            </p>
          </div>
        </div>

        <div className="pt-8 lg:pt-0">
          <p className="section-kicker">Una experiencia diferente</p>
          <h2 className="section-title mt-5 text-brand-deep">
            Menos estrés. Más confianza.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#6b646d]">
            Observamos, escuchamos y adaptamos cada visita. No trabajamos en
            serie: dedicamos el tiempo necesario para que el cuidado sea una
            experiencia positiva.
          </p>
          <div className="mt-9 border-t border-brand-primary/18">
            {[
              ["Tiempo dedicado", "Bloques según el servicio y su tamaño."],
              [
                "Ambiente seguro",
                "Rutinas suaves, espacio limpio y acompañamiento.",
              ],
              [
                "Trato personalizado",
                "Consideramos su edad, carácter y experiencias.",
              ],
            ].map(([title, text], index) => (
              <div
                key={title}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-brand-primary/18 py-5"
              >
                <span className="font-display text-lg text-brand-primary">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-extrabold text-brand-deep">{title}</h3>
                  <p className="mt-1 leading-6 text-[#6b646d]">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/agendar"
            className="mt-9 inline-flex items-center gap-3 font-extrabold text-brand-primary"
          >
            Conversemos sobre tu mascota
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AboutTeaser(): JSX.Element {
  return (
    <section className="deferred-section section-pad bg-brand-cream">
      <div className="site-container grid overflow-hidden bg-brand-deep text-white lg:grid-cols-2">
        <div className="order-2 p-8 sm:p-12 lg:order-1 lg:p-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
            Nosotros
          </p>
          <h2 className="section-title mt-5 max-w-xl text-white">
            Personas que entienden que el cuidado empieza por la confianza.
          </h2>
          <p className="mt-6 max-w-xl leading-8 text-[#ded2e0]">
            Caninany nace para ofrecer una experiencia de higiene más tranquila,
            transparente y atenta a las señales de cada perro.
          </p>
          <Link
            to="/nosotros"
            className="mt-9 inline-flex min-h-12 items-center gap-3 border border-white/40 px-6 text-sm font-extrabold transition hover:bg-white hover:text-brand-deep"
          >
            Conocer nuestra forma de trabajar
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="image-reveal order-1 min-h-80 lg:order-2">
          <img
            src="/images/happy-clients.webp"
            alt="Una clienta junto a sus perros después de su visita"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function ReviewsSection(): JSX.Element {
  return (
    <section id="opiniones" className="deferred-section section-pad bg-white">
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="section-kicker">Experiencias compartidas</p>
            <h2 className="section-title mt-5 text-brand-deep">
              Buenas visitas dejan huella.
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-brand-muted lg:justify-self-end">
            Relatos de familias que valoran una atención cercana, paciente y
            fácil de coordinar.
          </p>
        </div>

        <div className="mt-12 grid border-y border-[#e4dfe5] lg:grid-cols-3">
          {reviews.map((review, index) => (
            <article
              key={review.name}
              className="border-b border-[#e4dfe5] px-0 py-9 lg:border-b-0 lg:border-r lg:px-9 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="font-display text-5xl leading-none text-brand-yellow">
                “
              </span>
              <blockquote className="mt-3 font-display text-xl leading-snug text-brand-deep sm:text-2xl">
                {review.quote}
              </blockquote>
              <div className="mt-7 flex items-center gap-3">
                <span
                  className={`grid size-10 place-items-center ${index === 1 ? "bg-brand-bright" : "bg-brand-primary"} text-white`}
                >
                  <PawPrint className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-brand-deep">
                    {review.name}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {review.pet}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingSection(): JSX.Element {
  return (
    <section
      id="reservar"
      className="deferred-section section-pad bg-brand-bright"
    >
      <div className="site-container grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="text-white lg:sticky lg:top-40">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#f4eaf5]">
            Reserva online
          </p>
          <h2 className="section-title mt-5 text-white">
            Agenda el cuidado que necesita.
          </h2>
          <p className="mt-6 max-w-xl leading-8 text-[#f7eff8]">
            Elige el servicio, cuéntanos el peso de tu mascota y revisa la
            disponibilidad real. El equipo te contactará para confirmar.
          </p>
          <div className="mt-8 grid gap-3 border-t border-white/25 pt-6 text-sm font-bold">
            {[
              "Baño y oídos disponibles por separado",
              "Duración calculada según peso",
              "Solicitud protegida contra dobles reservas",
            ].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center bg-white/15">
                  <Check className="size-4" />
                </span>
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-brand-cream p-5 shadow-[0_30px_80px_rgba(116,71,118,0.2)] sm:p-8 lg:p-10">
          <DeferredAppointmentForm />
        </div>
      </div>
    </section>
  );
}
