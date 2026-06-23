import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";

import type {
  GoogleIdentityVerifier,
  VerifiedGoogleIdentity,
} from "../../application/ports/google-identity.port";
import {
  GoogleUnavailableError,
  InvalidGoogleTokenError,
} from "../../domain/errors/domain.error";

@Injectable()
export class GoogleIdentityVerifierService implements GoogleIdentityVerifier {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: ConfigService) {}

  async verify(credential: string): Promise<VerifiedGoogleIdentity> {
    const clientId = this.config.get<string>("GOOGLE_CLIENT_ID");
    if (!clientId) {
      throw new GoogleUnavailableError(
        "El acceso con Google no está configurado.",
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email || payload.email_verified !== true) {
        throw new InvalidGoogleTokenError(
          "Google no entregó una identidad de correo verificada.",
        );
      }

      return {
        subject: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name?.trim() || payload.email.split("@")[0] || "Cliente",
        avatarUrl: this.safeAvatarUrl(payload.picture),
      };
    } catch (error) {
      if (error instanceof InvalidGoogleTokenError) throw error;
      throw new InvalidGoogleTokenError(
        "La credencial de Google expiró o no es válida.",
      );
    }
  }

  private safeAvatarUrl(value: string | undefined): string | null {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.toString() : null;
    } catch {
      return null;
    }
  }
}
