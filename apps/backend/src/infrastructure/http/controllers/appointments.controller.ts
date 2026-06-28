import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  updateAppointmentStatusSchema,
  type AdminAppointmentDto,
  type AppointmentCalendarDto,
  type AppointmentDto,
  type AvailableSlotsDto,
  type CreateAppointmentInput,
  type CreatePublicAppointmentRequestInput,
  type GetAppointmentCalendarQuery,
  type GetAvailableSlotsQuery,
  type PublicAppointmentRequestDto,
  type UpdateAppointmentStatusInput,
} from "@caninany/shared";

import { CreateAppointmentUseCase } from "../../../application/use-cases/create-appointment.use-case";
import { CreatePublicAppointmentRequestUseCase } from "../../../application/use-cases/create-public-appointment-request.use-case";
import { GetAppointmentCalendarUseCase } from "../../../application/use-cases/get-appointment-calendar.use-case";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/get-available-slots.use-case";
import { GetMyAppointmentsUseCase } from "../../../application/use-cases/get-my-appointments.use-case";
import { ListAdminAppointmentsUseCase } from "../../../application/use-cases/list-admin-appointments.use-case";
import { UpdateAppointmentStatusUseCase } from "../../../application/use-cases/update-appointment-status.use-case";
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
    private readonly getMyAppointments: GetMyAppointmentsUseCase,
    private readonly listAdminAppointments: ListAdminAppointmentsUseCase,
    private readonly updateAppointmentStatus: UpdateAppointmentStatusUseCase,
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

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("cliente")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Appointments for the authenticated client." })
  listMyAppointments(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AppointmentDto[]> {
    return this.getMyAppointments.execute(user.id);
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Appointments for administration." })
  listAdmin(): Promise<AdminAppointmentDto[]> {
    return this.listAdminAppointments.execute();
  }

  @Patch("admin/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Appointment status updated." })
  updateStatus(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAppointmentStatusSchema))
    input: UpdateAppointmentStatusInput,
  ): Promise<AdminAppointmentDto> {
    return this.updateAppointmentStatus.execute(id, input.status);
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
