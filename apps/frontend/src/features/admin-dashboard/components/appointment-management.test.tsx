import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppointmentManagement } from "./appointment-management";

function renderPanel(): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <AppointmentManagement />
    </QueryClientProvider>,
  );
}

describe("AppointmentManagement", () => {
  it("renders the appointment administration area", () => {
    const markup = renderPanel();

    expect(markup).toContain("Gestión de citas");
    expect(markup).toContain("Cargando citas");
  });
});
