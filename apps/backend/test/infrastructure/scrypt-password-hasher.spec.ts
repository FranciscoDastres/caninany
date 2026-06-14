import { describe, expect, it } from "vitest";

import { ScryptPasswordHasher } from "../../src/infrastructure/auth/scrypt-password-hasher";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();

  it("stores a salted hash and validates the original password", async () => {
    const hash = await hasher.hash("una-clave-segura");

    expect(hash).not.toContain("una-clave-segura");
    await expect(hasher.verify("una-clave-segura", hash)).resolves.toBe(true);
    await expect(hasher.verify("otra-clave", hash)).resolves.toBe(false);
  });
});
