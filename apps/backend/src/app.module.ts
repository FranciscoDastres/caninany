import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import {
  ACTION_TOKEN_CODEC,
  type ActionTokenCodec,
} from "./application/ports/action-token.port";
import {
  AUTH_NOTIFICATION,
  type AuthNotification,
} from "./application/ports/auth-notification.port";
import {
  BUSINESS_CALENDAR,
  type BusinessCalendar,
} from "./application/ports/business-calendar.port";
import { CLOCK } from "./application/ports/clock.port";
import { ID_GENERATOR } from "./application/ports/id-generator.port";
import {
  GOOGLE_IDENTITY,
  type GoogleIdentityVerifier,
} from "./application/ports/google-identity.port";
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from "./application/ports/password-hasher.port";
import {
  REFRESH_TOKEN_CODEC,
  type RefreshTokenCodec,
} from "./application/ports/refresh-token.port";
import {
  AUTH_SESSION_REPOSITORY,
  type AuthSessionRepository,
} from "./domain/repositories/auth-session.repository";
import {
  AUTH_TOKEN_REPOSITORY,
  type AuthTokenRepository,
} from "./domain/repositories/auth-token.repository";
import {
  TOKEN_ISSUER,
  type TokenIssuer,
} from "./application/ports/token-issuer.port";
import { AdminUsersService } from "./application/services/admin-users.service";
import { ScheduleAppointmentService } from "./application/services/schedule-appointment.service";
import { AuthApplicationService } from "./application/services/auth-application.service";
import { PurchasesService } from "./application/services/purchases.service";
import { PetsService } from "./application/services/pets.service";
import { SiteConfigurationService } from "./application/services/site-configuration.service";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";
import { CreatePublicAppointmentRequestUseCase } from "./application/use-cases/create-public-appointment-request.use-case";
import { GetAppointmentCalendarUseCase } from "./application/use-cases/get-appointment-calendar.use-case";
import { GetAvailableSlotsUseCase } from "./application/use-cases/get-available-slots.use-case";
import { GetMyAppointmentsUseCase } from "./application/use-cases/get-my-appointments.use-case";
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
} from "./domain/repositories/appointment.repository";
import {
  PET_REPOSITORY,
  type PetRepository,
} from "./domain/repositories/pet.repository";
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
import { CryptoActionTokenCodec } from "./infrastructure/auth/crypto-action-token.codec";
import { CryptoRefreshTokenCodec } from "./infrastructure/auth/crypto-refresh-token.codec";
import { GoogleIdentityVerifierService } from "./infrastructure/auth/google-identity.verifier";
import { JwtStrategy } from "./infrastructure/auth/jwt.strategy";
import { JwtTokenIssuer } from "./infrastructure/auth/jwt-token-issuer";
import { RolesGuard } from "./infrastructure/auth/roles.guard";
import { ScryptPasswordHasher } from "./infrastructure/auth/scrypt-password-hasher";
import { validateEnvironment } from "./infrastructure/config/environment";
import { PrismaService } from "./infrastructure/database/prisma/prisma.service";
import { PrismaAppointmentRepository } from "./infrastructure/database/prisma/repositories/prisma-appointment.repository";
import { PrismaAuthSessionRepository } from "./infrastructure/database/prisma/repositories/prisma-auth-session.repository";
import { PrismaAuthTokenRepository } from "./infrastructure/database/prisma/repositories/prisma-auth-token.repository";
import { PrismaPurchaseRepository } from "./infrastructure/database/prisma/repositories/prisma-purchase.repository";
import { PrismaPetRepository } from "./infrastructure/database/prisma/repositories/prisma-pet.repository";
import { PrismaSiteConfigurationRepository } from "./infrastructure/database/prisma/repositories/prisma-site-configuration.repository";
import { PrismaUserRepository } from "./infrastructure/database/prisma/repositories/prisma-user.repository";
import { AuthController } from "./infrastructure/http/controllers/auth.controller";
import { DomainExceptionFilter } from "./infrastructure/http/domain-exception.filter";
import { AppointmentsController } from "./infrastructure/http/controllers/appointments.controller";
import { HealthController } from "./infrastructure/http/controllers/health.controller";
import { PurchasesController } from "./infrastructure/http/controllers/purchases.controller";
import { PetsController } from "./infrastructure/http/controllers/pets.controller";
import { SiteConfigurationController } from "./infrastructure/http/controllers/site-configuration.controller";
import { UsersController } from "./infrastructure/http/controllers/users.controller";
import { RateLimitGuard } from "./infrastructure/http/rate-limit.guard";
import { CryptoIdGenerator } from "./infrastructure/ids/crypto-id-generator";
import { LocalImageStorage } from "./infrastructure/storage/local-image-storage";
import { IntlBusinessCalendar } from "./infrastructure/time/intl-business-calendar";
import { SystemClock } from "./infrastructure/time/system-clock";
import { AuthNotificationService } from "./infrastructure/mail/auth-notification.service";

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
        signOptions: { expiresIn: "10m" },
      }),
    }),
  ],
  controllers: [
    AppointmentsController,
    AuthController,
    HealthController,
    PetsController,
    PurchasesController,
    SiteConfigurationController,
    UsersController,
  ],
  providers: [
    PrismaService,
    PrismaAuthSessionRepository,
    PrismaAuthTokenRepository,
    PrismaAppointmentRepository,
    PrismaPetRepository,
    PrismaPurchaseRepository,
    PrismaSiteConfigurationRepository,
    PrismaUserRepository,
    CryptoIdGenerator,
    CryptoActionTokenCodec,
    CryptoRefreshTokenCodec,
    GoogleIdentityVerifierService,
    IntlBusinessCalendar,
    JwtTokenIssuer,
    LocalImageStorage,
    ScryptPasswordHasher,
    SystemClock,
    JwtStrategy,
    RolesGuard,
    AdminBootstrapService,
    AuthNotificationService,
    RateLimitGuard,
    {
      provide: GOOGLE_IDENTITY,
      useExisting: GoogleIdentityVerifierService,
    },
    {
      provide: ACTION_TOKEN_CODEC,
      useExisting: CryptoActionTokenCodec,
    },
    {
      provide: AUTH_NOTIFICATION,
      useExisting: AuthNotificationService,
    },
    {
      provide: AUTH_SESSION_REPOSITORY,
      useExisting: PrismaAuthSessionRepository,
    },
    {
      provide: AUTH_TOKEN_REPOSITORY,
      useExisting: PrismaAuthTokenRepository,
    },
    {
      provide: APPOINTMENT_REPOSITORY,
      useExisting: PrismaAppointmentRepository,
    },
    {
      provide: REFRESH_TOKEN_CODEC,
      useExisting: CryptoRefreshTokenCodec,
    },
    {
      provide: PET_REPOSITORY,
      useExisting: PrismaPetRepository,
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
      provide: ScheduleAppointmentService,
      inject: [APPOINTMENT_REPOSITORY, ID_GENERATOR, CLOCK, BUSINESS_CALENDAR],
      useFactory: (
        appointments: AppointmentRepository,
        ids: CryptoIdGenerator,
        clock: SystemClock,
        calendar: BusinessCalendar,
      ) => new ScheduleAppointmentService(appointments, ids, clock, calendar),
    },
    {
      provide: CreateAppointmentUseCase,
      inject: [ScheduleAppointmentService, PET_REPOSITORY],
      useFactory: (
        scheduler: ScheduleAppointmentService,
        pets: PetRepository,
      ) => new CreateAppointmentUseCase(scheduler, pets),
    },
    {
      provide: CreatePublicAppointmentRequestUseCase,
      inject: [ScheduleAppointmentService],
      useFactory: (scheduler: ScheduleAppointmentService) =>
        new CreatePublicAppointmentRequestUseCase(scheduler),
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
      provide: GetAppointmentCalendarUseCase,
      inject: [APPOINTMENT_REPOSITORY, BUSINESS_CALENDAR, CLOCK],
      useFactory: (
        appointments: AppointmentRepository,
        calendar: IntlBusinessCalendar,
        clock: SystemClock,
      ) => new GetAppointmentCalendarUseCase(appointments, calendar, clock),
    },
    {
      provide: GetMyAppointmentsUseCase,
      inject: [APPOINTMENT_REPOSITORY],
      useFactory: (appointments: AppointmentRepository) =>
        new GetMyAppointmentsUseCase(appointments),
    },
    {
      provide: AuthApplicationService,
      inject: [
        USER_REPOSITORY,
        PASSWORD_HASHER,
        TOKEN_ISSUER,
        AUTH_SESSION_REPOSITORY,
        REFRESH_TOKEN_CODEC,
        ID_GENERATOR,
        CLOCK,
        AUTH_TOKEN_REPOSITORY,
        ACTION_TOKEN_CODEC,
        AUTH_NOTIFICATION,
        GOOGLE_IDENTITY,
      ],
      useFactory: (
        users: UserRepository,
        passwords: PasswordHasher,
        tokens: TokenIssuer,
        sessions: AuthSessionRepository,
        refreshTokens: RefreshTokenCodec,
        ids: CryptoIdGenerator,
        clock: SystemClock,
        authTokens: AuthTokenRepository,
        actionTokens: ActionTokenCodec,
        notifications: AuthNotification,
        googleIdentity: GoogleIdentityVerifier,
      ) =>
        new AuthApplicationService(
          users,
          passwords,
          tokens,
          sessions,
          refreshTokens,
          ids,
          clock,
          authTokens,
          actionTokens,
          notifications,
          googleIdentity,
        ),
    },
    {
      provide: AdminUsersService,
      inject: [USER_REPOSITORY, AUTH_SESSION_REPOSITORY, CLOCK],
      useFactory: (
        users: UserRepository,
        sessions: AuthSessionRepository,
        clock: SystemClock,
      ) => new AdminUsersService(users, sessions, clock),
    },
    {
      provide: PetsService,
      inject: [PET_REPOSITORY, ID_GENERATOR],
      useFactory: (pets: PetRepository, ids: CryptoIdGenerator) =>
        new PetsService(pets, ids),
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
      provide: APP_GUARD,
      useExisting: RateLimitGuard,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
