import { Injectable } from "@nestjs/common";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

import type { PasswordHasher } from "../../application/ports/password-hasher.port";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString("hex")}`;
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    const [algorithm, salt, storedKey] = passwordHash.split("$");
    if (algorithm !== "scrypt" || !salt || !storedKey) {
      return false;
    }

    const storedBuffer = Buffer.from(storedKey, "hex");
    if (storedBuffer.length !== KEY_LENGTH) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return timingSafeEqual(storedBuffer, derivedKey);
  }
}
