import { ArrowUpRight, X } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";

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
    description: "Agua tibia, productos suaves y un proceso sin apuros.",
  },
  {
    image: "/images/ear-care.webp",
    alt: "Spaniel recibiendo limpieza externa de oídos",
    category: "Bienestar",
    title: "Cuidado atento y delicado",
    description: "Revisión y limpieza externa respetando cada señal.",
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
    description: "Ese bienestar que se nota desde que salen.",
  },
];

export function GallerySection(): JSX.Element {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  return (
    <>
      <section
        id="galeria"
        className="deferred-section section-pad bg-brand-deep text-white"
      >
        <div className="site-container">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
                <span className="h-0.5 w-7 bg-brand-yellow" />
                Momentos Caninany
              </p>
              <h2 className="section-title mt-5 max-w-2xl text-white">
                El cuidado también puede verse así de tranquilo.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#ded2e0] lg:justify-self-end">
              Conoce nuestra forma de trabajar y algunas de las visitas que
              hacen especial cada semana.
            </p>
          </div>

          <div className="mt-14 grid auto-rows-[250px] gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[285px]">
            {galleryItems.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`image-reveal group relative text-left ${
                  index === 0
                    ? "lg:col-span-5 lg:row-span-2"
                    : index === 1
                      ? "lg:col-span-7"
                      : index === 2
                        ? "lg:col-span-4"
                        : "lg:col-span-3"
                }`}
                aria-label={`Ampliar: ${item.title}`}
                onClick={() => setSelected(item)}
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/8 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <span>
                    <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-brand-yellow">
                      {item.category}
                    </span>
                    <span className="mt-2 block text-lg font-extrabold leading-tight sm:text-xl">
                      {item.title}
                    </span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center bg-white text-brand-deep transition group-hover:bg-brand-yellow">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(calc(100%_-_2rem),64rem)] max-w-none overflow-hidden bg-brand-cream p-0 text-brand-ink shadow-2xl"
        aria-labelledby="gallery-dialog-title"
        onClose={() => setSelected(null)}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
      >
        {selected ? (
          <div>
            <div className="relative">
              <button
                type="button"
                className="absolute right-4 top-4 z-10 grid size-11 place-items-center bg-white text-brand-deep shadow-lg"
                aria-label="Cerrar imagen"
                onClick={() => dialogRef.current?.close()}
              >
                <X className="size-5" />
              </button>
              <img
                src={selected.image}
                alt={selected.alt}
                className="max-h-[68vh] w-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="eyebrow">{selected.category}</p>
              <h3
                id="gallery-dialog-title"
                className="mt-2 font-display text-2xl text-brand-deep sm:text-3xl"
              >
                {selected.title}
              </h3>
              <p className="mt-3 text-brand-muted">{selected.description}</p>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
