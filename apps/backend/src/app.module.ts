import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { BUSINESS_CALENDAR } from "./application/ports/business-calendar.port";
import { CLOCK } from "./application/ports/clock.port";
import { ID_GENERATOR } from "./application/ports/id-generator.port";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "./application/use-cases/get-available-slots.use-case";
import {
  APPOINTMENT_REPOSITORY,
  type AppointmentRepository,
} from "./domain/repositories/appointment.repository";
import { JwtStrategy } from "./infrastructure/auth/jwt.strategy";
import { RolesGuard } from "./infrastructure/auth/roles.guard";
import { validateEnvironment } from "./infrastructure/config/environment";
import { PrismaService } from "./infrastructure/database/prisma/prisma.service";
import { PrismaAppointmentRepository } from "./infrastructure/database/prisma/repositories/prisma-appointment.repository";
import { DomainExceptionFilter } from "./infrastructure/http/domain-exception.filter";
import { AppointmentsController } from "./infrastructure/http/controllers/appointments.controller";
import { HealthController } from "./infrastructure/http/controllers/health.controller";
import { CryptoIdGenerator } from "./infrastructure/ids/crypto-id-generator";
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
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [AppointmentsController, HealthController],
  providers: [
    PrismaService,
    PrismaAppointmentRepository,
    CryptoIdGenerator,
    IntlBusinessCalendar,
    SystemClock,
    JwtStrategy,
    RolesGuard,
    {
      provide: APPOINTMENT_REPOSITORY,
      useExisting: PrismaAppointmentRepository,
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
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
