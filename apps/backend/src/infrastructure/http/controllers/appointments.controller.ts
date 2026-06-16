import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  createAppointmentSchema,
  createPublicAppointmentRequestSchema,
  getAppointmentCalendarQuerySchema,
  getAvailableSlotsQuerySchema,
  type AppointmentCalendarDto,
  type AppointmentDto,
  type AvailableSlotsDto,
  type CreateAppointmentInput,
  type CreatePublicAppointmentRequestInput,
  type GetAppointmentCalendarQuery,
  type GetAvailableSlotsQuery,
  type PublicAppointmentRequestDto,
} from "@caninany/shared";

import { CreateAppointmentUseCase } from "../../../application/use-cases/create-appointment.use-case";
import { CreatePublicAppointmentRequestUseCase } from "../../../application/use-cases/create-public-appointment-request.use-case";
import { GetAppointmentCalendarUseCase } from "../../../application/use-cases/get-appointment-calendar.use-case";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/get-available-slots.use-case";
import type { AuthenticatedUser } from "../../auth/authenticated-user";
import { CurrentUser } from "../../auth/current-user.decorator";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly createPublicRequest: CreatePublicAppointmentRequestUseCase,
    private readonly getCalendar: GetAppointmentCalendarUseCase,
    private readonly getAvailableSlots: GetAvailableSlotsUseCase,
  ) {}

  @Get("calendar")
  @ApiOkResponse({ description: "Monthly public availability calendar." })
  getMonthlyCalendar(
    @Query(new ZodValidationPipe(getAppointmentCalendarQuerySchema))
    query: GetAppointmentCalendarQuery,
  ): Promise<AppointmentCalendarDto> {
    return this.getCalendar.execute(query);
  }

  @Get("available-slots")
  @ApiOkResponse({ description: "Available appointment slots." })
  getSlots(
    @Query(new ZodValidationPipe(getAvailableSlotsQuerySchema))
    query: GetAvailableSlotsQuery,
  ): Promise<AvailableSlotsDto> {
    return this.getAvailableSlots.execute(query);
  }

  @Post("requests")
  @ApiCreatedResponse({ description: "Public appointment request created." })
  createRequest(
    @Body(new ZodValidationPipe(createPublicAppointmentRequestSchema))
    input: CreatePublicAppointmentRequestInput,
  ): Promise<PublicAppointmentRequestDto> {
    return this.createPublicRequest.execute(input);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "cliente")
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: "Appointment created." })
  create(
    @Body(new ZodValidationPipe(createAppointmentSchema))
    input: CreateAppointmentInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AppointmentDto> {
    const customerId = user.role === "admin" ? input.customerId : user.id;
    if (!customerId) {
      throw new BadRequestException(
        "Selecciona el cliente para crear la reserva.",
      );
    }

    return this.createAppointment.execute({
      customerId,
      petId: input.petId,
      service: input.service,
      startsAt: new Date(input.startsAt),
      ...(input.notes ? { notes: input.notes } : {}),
    });
  }
}
