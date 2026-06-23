import type { JSX } from "react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

const AppointmentForm = lazy(async () => {
  const module = await import("./appointment-form");
  return { default: module.AppointmentForm };
});

export function DeferredAppointmentForm(): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const target = container.current;
    if (!target || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={container}>
      {shouldLoad ? (
        <Suspense fallback={<AppointmentFormPlaceholder />}>
          <AppointmentForm />
        </Suspense>
      ) : (
        <AppointmentFormPlaceholder />
      )}
    </div>
  );
}

function AppointmentFormPlaceholder(): JSX.Element {
  return (
    <div
      className="grid min-h-[560px] animate-pulse content-start gap-5"
      aria-label="Preparando formulario de reserva"
      role="status"
    >
      <span className="h-5 w-36 rounded-full bg-[#eee9ef]" />
      <span className="h-8 w-2/3 rounded-xl bg-[#eee9ef]" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className="h-28 rounded-[1.15rem] bg-[#eee9ef]" />
        ))}
      </div>
      <span className="h-14 rounded-xl bg-[#eee9ef]" />
      <span className="h-14 rounded-xl bg-[#eee9ef]" />
      <span className="h-40 rounded-[1.5rem] bg-[#eee9ef]" />
    </div>
  );
}
