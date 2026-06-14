import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from "../../application/ports/password-hasher.port";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "../../domain/repositories/user.repository";

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwords: PasswordHasher,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>("ADMIN_EMAIL");
    const password = this.config.get<string>("ADMIN_PASSWORD");
    const name = this.config.get<string>("ADMIN_NAME");

    if (!email || !password || !name || (await this.users.findByEmail(email))) {
      return;
    }

    await this.users.create({
      email,
      name,
      passwordHash: await this.passwords.hash(password),
      role: "admin",
    });
    this.logger.log(`Cuenta administradora inicial creada para ${email}.`);
  }
}
