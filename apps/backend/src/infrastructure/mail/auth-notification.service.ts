import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AuthNotification } from "../../application/ports/auth-notification.port";

@Injectable()
export class AuthNotificationService implements AuthNotification {
  private readonly logger = new Logger(AuthNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  sendVerification(email: string, token: string): Promise<void> {
    const url = this.buildUrl("/verificar-correo", token);
    return this.send(
      email,
      "Verifica tu correo en Caninany",
      `Verifica tu correo usando este enlace (válido por 24 horas): ${url}`,
      url,
    );
  }

  sendPasswordReset(email: string, token: string): Promise<void> {
    const url = this.buildUrl("/restablecer-contrasena", token);
    return this.send(
      email,
      "Restablece tu contraseña de Caninany",
      `Restablece tu contraseña usando este enlace (válido por 30 minutos): ${url}`,
      url,
    );
  }

  private buildUrl(path: string, token: string): string {
    const url = new URL(path, this.config.getOrThrow<string>("APP_PUBLIC_URL"));
    url.searchParams.set("token", token);
    return url.toString();
  }

  private async send(
    to: string,
    subject: string,
    text: string,
    actionUrl: string,
  ): Promise<void> {
    if (this.config.getOrThrow<string>("MAIL_MODE") === "log") {
      this.logger.log(`[mail] to=${to} subject=${subject} action=${actionUrl}`);
      return;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.getOrThrow<string>("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.config.getOrThrow<string>("MAIL_FROM"),
        to: [to],
        subject,
        text,
      }),
    });
    if (!response.ok) {
      this.logger.error(
        `Resend rechazó el correo con estado ${response.status}.`,
      );
      throw new Error("No fue posible enviar el correo transaccional.");
    }
  }
}
