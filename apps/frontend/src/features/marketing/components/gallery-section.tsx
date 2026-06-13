import { ArrowUpRight, X } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useState } from "react";

interface GalleryItem {
  alt: string;
  category: string;
  description: string;
  image: string;
  title: string;
}

const galleryItems: GalleryItem[] = [
  {
    image: "/images/dog-bath.webp",
    alt: "Perrito blanco disfrutando un baño suave",
    category: "Baño",
    title: "Una pausa para relajarse",
    description: "Agua tibia, productos suaves y mucho cariño.",
  },
  {
    image: "/images/ear-care.webp",
    alt: "Spaniel recibiendo limpieza externa de oídos",
    category: "Bienestar",
    title: "Cuidado atento y delicado",
    description: "Revisión y limpieza externa sin apuros.",
  },
  {
    image: "/images/happy-clients.webp",
    alt: "Clienta feliz junto a sus dos perros",
    category: "Comunidad",
    title: "Familias que vuelven felices",
    description: "La tranquilidad de dejarlos en buenas manos.",
  },
  {
    image: "/images/caninany-hero.webp",
    alt: "Golden retriever recién bañado en Caninany",
    category: "Resultado",
    title: "Limpios, suaves y radiantes",
    description: "Ese brillo que se nota desde que salen.",
  },
];

export function GallerySection(): JSX.Element {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!selected) return;

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setSelected(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selected]);

  return (
    <>
      <section
        id="galeria"
        className="bg-[#183c2d] px-5 py-24 text-white sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#e1a985]">
                Momentos Caninany
              </p>
              <h2 className="mt-5 max-w-2xl font-display text-5xl leading-[0.98] sm:text-6xl">
                El cuidado también puede verse así de bonito.
              </h2>
            </div>
            <p className="max-w-md leading-7 text-[#c8d4cd]">
              Conoce nuestro espacio, la forma en que trabajamos y algunas de
              las visitas que nos alegran la semana.
            </p>
          </div>

          <div className="mt-14 grid auto-rows-[260px] gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[280px]">
            {galleryItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`image-reveal group relative rounded-[2rem] text-left ${
                  index === 0
                    ? "lg:col-span-4 lg:row-span-2"
                    : index === 1
                      ? "lg:col-span-4"
                      : index === 2
                        ? "lg:col-span-4"
                        : "lg:col-span-8"
                }`}
                onClick={() => setSelected(item)}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <span>
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f0b891]">
                      {item.category}
                    </span>
                    <span className="mt-2 block text-xl font-bold">
                      {item.title}
                    </span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#183c2d] transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-[#9fb2a8]">
            La galería está preparada para seguir creciendo con nuevas visitas.
          </p>
        </div>
      </section>

      {selected ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#0c2118]/90 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelected(null);
          }}
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-[#fffaf3] shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-[#183c2d] shadow-lg"
              aria-label="Cerrar imagen"
              onClick={() => setSelected(null)}
            >
              <X className="size-5" />
            </button>
            <img
              src={selected.image}
              alt={selected.alt}
              className="max-h-[72vh] w-full object-cover"
            />
            <div className="p-6 sm:p-8">
              <p className="eyebrow">{selected.category}</p>
              <h3 className="mt-2 font-display text-3xl text-[#183c2d]">
                {selected.title}
              </h3>
              <p className="mt-2 text-[#66766e]">{selected.description}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
