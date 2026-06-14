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
      className="grid min-h-[760px] animate-pulse content-start gap-7"
      aria-label="Preparando formulario de reserva"
      role="status"
    >
      <span className="h-5 w-36 rounded-full bg-[#e8e1d7]" />
      <span className="h-10 w-3/4 rounded-xl bg-[#e8e1d7]" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className="h-32 rounded-[1.4rem] bg-[#eee8df]" />
        ))}
      </div>
      <span className="h-14 rounded-xl bg-[#eee8df]" />
      <span className="h-14 rounded-xl bg-[#eee8df]" />
      <span className="h-64 rounded-[1.75rem] bg-[#eee8df]" />
    </div>
  );
}
