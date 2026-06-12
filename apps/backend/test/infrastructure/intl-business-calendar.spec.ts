import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { IntlBusinessCalendar } from "../../src/infrastructure/time/intl-business-calendar";

describe("IntlBusinessCalendar", () => {
  const calendar = new IntlBusinessCalendar(
    new ConfigService({
      BUSINESS_TIMEZONE: "America/Santiago",
      BUSINESS_OPENING_HOUR: 9,
      BUSINESS_CLOSING_HOUR: 18,
    }),
  );

  it("uses the winter UTC offset for Santiago", () => {
    const businessDay = calendar.getBusinessDay("2026-06-20");

    expect(businessDay.opening.toISOString()).toBe("2026-06-20T13:00:00.000Z");
  });

  it("uses the summer UTC offset for Santiago", () => {
    const businessDay = calendar.getBusinessDay("2026-01-20");

    expect(businessDay.opening.toISOString()).toBe("2026-01-20T12:00:00.000Z");
  });
});
