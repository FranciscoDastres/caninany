import { describe, expect, it } from "vitest";

import { createPetSchema } from "./pet.schema";

describe("createPetSchema", () => {
  it("accepts a complete pet profile", () => {
    const result = createPetSchema.parse({
      name: "Milo",
      breed: "Mestizo",
      weightKg: 12.5,
      dateOfBirth: "2022-04-10",
      medicalNotes: "Piel sensible.",
      behaviorNotes: "Prefiere pausas durante el secado.",
    });

    expect(result.name).toBe("Milo");
    expect(result.weightKg).toBe(12.5);
  });

  it("rejects weights outside the supported range", () => {
    expect(() =>
      createPetSchema.parse({
        name: "Milo",
        weightKg: 0.2,
      }),
    ).toThrow();
  });
});
