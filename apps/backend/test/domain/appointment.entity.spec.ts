import { describe, expect, it } from "vitest";

import { Appointment } from "../../src/domain/entities/appointment.entity";

const baseAppointment = {
  id: "appointment",
  service: "bath" as const,
  startsAt: new Date("2026-06-20T13:00:00.000Z"),
  durationMinutes: 45,
};

describe("Appointment", () => {
  it("requires exactly one complete requester type", () => {
    expect(() =>
      Appointment.create({
        ...baseAppointment,
        customerId: "customer",
        petId: "pet",
        publicRequester: {
          ownerName: "Camila",
          phone: "+56 9 1234 5678",
          petName: "Milo",
          petWeightKg: 8,
        },
      }),
    ).toThrow("exactly one complete requester type");

    expect(() =>
      Appointment.create({
        ...baseAppointment,
        customerId: "customer",
      }),
    ).toThrow("exactly one complete requester type");
  });
});
