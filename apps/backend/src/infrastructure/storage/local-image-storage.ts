import {
  BadRequestException,
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { access, mkdir, writeFile } from "fs/promises";
import { basename, join } from "path";
import { randomUUID } from "crypto";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export interface ImageUpload {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class LocalImageStorage implements OnModuleInit {
  private readonly directory: string;
  private readonly publicApiUrl: string;

  constructor(config: ConfigService) {
    this.directory = config.getOrThrow<string>("UPLOADS_DIR");
    this.publicApiUrl = config
      .getOrThrow<string>("PUBLIC_API_URL")
      .replace(/\/$/, "");
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.directory, { recursive: true });
  }

  async save(file: ImageUpload): Promise<string> {
    const extension = IMAGE_EXTENSIONS[file.mimetype];
    if (!extension) {
      throw new BadRequestException(
        "La imagen debe estar en formato JPG, PNG o WebP.",
      );
    }
    if (!this.hasValidSignature(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        "El contenido del archivo no es una imagen válida.",
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("La imagen no puede superar los 5 MB.");
    }

    const filename = `${randomUUID()}${extension}`;
    await writeFile(join(this.directory, filename), file.buffer, {
      flag: "wx",
    });
    return `${this.publicApiUrl}/configuracion-sitio/imagenes/${filename}`;
  }

  async resolve(filename: string): Promise<{
    contentType: string;
    path: string;
  }> {
    const safeFilename = basename(filename);
    if (safeFilename !== filename) {
      throw new NotFoundException("Imagen no encontrada.");
    }

    const extension = safeFilename.slice(safeFilename.lastIndexOf("."));
    const contentType = Object.entries(IMAGE_EXTENSIONS).find(
      ([, value]) => value === extension,
    )?.[0];
    if (!contentType) {
      throw new NotFoundException("Imagen no encontrada.");
    }

    const path = join(this.directory, safeFilename);
    try {
      await access(path);
    } catch {
      throw new NotFoundException("Imagen no encontrada.");
    }

    return { path, contentType };
  }

  private hasValidSignature(buffer: Buffer, mimetype: string): boolean {
    if (mimetype === "image/jpeg") {
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    }
    if (mimetype === "image/png") {
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (mimetype === "image/webp") {
      return (
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    }
    return false;
  }
}
