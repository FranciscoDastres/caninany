import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ClientAppointmentsPanel } from "./client-appointments-panel";

function renderPanel(): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <ClientAppointmentsPanel />
    </QueryClientProvider>,
  );
}

describe("ClientAppointmentsPanel", () => {
  it("renders the customer appointments area", () => {
    const markup = renderPanel();

    expect(markup).toContain("Mis citas");
    expect(markup).toContain("Cargando tus citas");
  });
});
