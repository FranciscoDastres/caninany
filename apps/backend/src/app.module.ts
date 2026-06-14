import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { BUSINESS_CALENDAR } from "./application/ports/business-calendar.port";
import { CLOCK } from "./application/ports/clock.port";
import { ID_GENERATOR } from "./application/ports/id-generator.port";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from "./application/ports/password-hasher.port";
import {
  TOKEN_ISSUER,
  type TokenIssuer,
} from "./application/ports/token-issuer.port";
import { AdminUsersService } from "./application/services/admin-users.service";
import { AuthApplicationService } from "./application/services/auth-application.service";
import { PurchasesService } from "./application/services/purchases.service";
import { SiteConfigurationService } from "./application/services/site-configuration.service";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "./application/use-cases/get-available-slots.use-case";
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
} from "./domain/repositories/appointment.repository";
import {
  PURCHASE_REPOSITORY,
  type PurchaseRepository,
} from "./domain/repositories/purchase.repository";
import {
  SITE_CONFIGURATION_REPOSITORY,
  type SiteConfigurationRepository,
} from "./domain/repositories/site-configuration.repository";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "./domain/repositories/user.repository";
import { AdminBootstrapService } from "./infrastructure/auth/admin-bootstrap.service";
import { JwtStrategy } from "./infrastructure/auth/jwt.strategy";
import { JwtTokenIssuer } from "./infrastructure/auth/jwt-token-issuer";
import { RolesGuard } from "./infrastructure/auth/roles.guard";
import { ScryptPasswordHasher } from "./infrastructure/auth/scrypt-password-hasher";
import { validateEnvironment } from "./infrastructure/config/environment";
import { PrismaService } from "./infrastructure/database/prisma/prisma.service";
import { PrismaAppointmentRepository } from "./infrastructure/database/prisma/repositories/prisma-appointment.repository";
import { PrismaPurchaseRepository } from "./infrastructure/database/prisma/repositories/prisma-purchase.repository";
import { PrismaSiteConfigurationRepository } from "./infrastructure/database/prisma/repositories/prisma-site-configuration.repository";
import { PrismaUserRepository } from "./infrastructure/database/prisma/repositories/prisma-user.repository";
import { AuthController } from "./infrastructure/http/controllers/auth.controller";
import { DomainExceptionFilter } from "./infrastructure/http/domain-exception.filter";
import { AppointmentsController } from "./infrastructure/http/controllers/appointments.controller";
import { HealthController } from "./infrastructure/http/controllers/health.controller";
import { PurchasesController } from "./infrastructure/http/controllers/purchases.controller";
import { SiteConfigurationController } from "./infrastructure/http/controllers/site-configuration.controller";
import { UsersController } from "./infrastructure/http/controllers/users.controller";
import { CryptoIdGenerator } from "./infrastructure/ids/crypto-id-generator";
import { LocalImageStorage } from "./infrastructure/storage/local-image-storage";
import { IntlBusinessCalendar } from "./infrastructure/time/intl-business-calendar";
import { SystemClock } from "./infrastructure/time/system-clock";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: "2h" },
      }),
    }),
  ],
  controllers: [
    AppointmentsController,
    AuthController,
    HealthController,
    PurchasesController,
    SiteConfigurationController,
    UsersController,
  ],
  providers: [
    PrismaService,
    PrismaAppointmentRepository,
    PrismaPurchaseRepository,
    PrismaSiteConfigurationRepository,
    PrismaUserRepository,
    CryptoIdGenerator,
    IntlBusinessCalendar,
    JwtTokenIssuer,
    LocalImageStorage,
    ScryptPasswordHasher,
    SystemClock,
    JwtStrategy,
    RolesGuard,
    AdminBootstrapService,
    {
      provide: APPOINTMENT_REPOSITORY,
      useExisting: PrismaAppointmentRepository,
    },
    {
      provide: PURCHASE_REPOSITORY,
      useExisting: PrismaPurchaseRepository,
    },
    {
      provide: SITE_CONFIGURATION_REPOSITORY,
      useExisting: PrismaSiteConfigurationRepository,
    },
    {
      provide: USER_REPOSITORY,
      useExisting: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useExisting: ScryptPasswordHasher,
    },
    {
      provide: TOKEN_ISSUER,
      useExisting: JwtTokenIssuer,
    },
    {
      provide: ID_GENERATOR,
      useExisting: CryptoIdGenerator,
    },
    {
      provide: CLOCK,
      useExisting: SystemClock,
    },
    {
      provide: BUSINESS_CALENDAR,
      useExisting: IntlBusinessCalendar,
    },
    {
      provide: CreateAppointmentUseCase,
      inject: [APPOINTMENT_REPOSITORY, ID_GENERATOR, CLOCK],
      useFactory: (
        appointments: AppointmentRepository,
        ids: CryptoIdGenerator,
        clock: SystemClock,
      ) => new CreateAppointmentUseCase(appointments, ids, clock),
    },
    {
      provide: GetAvailableSlotsUseCase,
      inject: [APPOINTMENT_REPOSITORY, BUSINESS_CALENDAR, CLOCK],
      useFactory: (
        appointments: AppointmentRepository,
        calendar: IntlBusinessCalendar,
        clock: SystemClock,
      ) => new GetAvailableSlotsUseCase(appointments, calendar, clock),
    },
    {
      provide: AuthApplicationService,
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_ISSUER],
      useFactory: (
        users: UserRepository,
        passwords: PasswordHasher,
        tokens: TokenIssuer,
      ) => new AuthApplicationService(users, passwords, tokens),
    },
    {
      provide: AdminUsersService,
      inject: [USER_REPOSITORY],
      useFactory: (users: UserRepository) => new AdminUsersService(users),
    },
    {
      provide: PurchasesService,
      inject: [PURCHASE_REPOSITORY],
      useFactory: (purchases: PurchaseRepository) =>
        new PurchasesService(purchases),
    },
    {
      provide: SiteConfigurationService,
      inject: [SITE_CONFIGURATION_REPOSITORY],
      useFactory: (configuration: SiteConfigurationRepository) =>
        new SiteConfigurationService(configuration),
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
