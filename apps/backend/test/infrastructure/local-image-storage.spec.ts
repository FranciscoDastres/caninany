import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { describe, expect, it } from "vitest";

import { LocalImageStorage } from "../../src/infrastructure/storage/local-image-storage";

describe("LocalImageStorage", () => {
  const storage = new LocalImageStorage(
    new ConfigService({
      UPLOADS_DIR: "/tmp/caninany-image-storage-test",
      PUBLIC_API_URL: "http://localhost:3000/api/v1",
    }),
  );

  it("rejects files whose binary signature does not match the image MIME", async () => {
    await expect(
      storage.save({
        buffer: Buffer.from("not-a-webp"),
        mimetype: "image/webp",
        size: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
