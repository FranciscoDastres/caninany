import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  createAppointmentSchema,
  getAvailableSlotsQuerySchema,
  type AppointmentDto,
  type AvailableSlotsDto,
  type CreateAppointmentInput,
  type GetAvailableSlotsQuery,
} from "@caninany/shared";

import { CreateAppointmentUseCase } from "../../../application/use-cases/create-appointment.use-case";
import { GetAvailableSlotsUseCase } from "../../../application/use-cases/get-available-slots.use-case";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { Roles } from "../../auth/roles.decorator";
import { RolesGuard } from "../../auth/roles.guard";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";

@ApiTags("appointments")
@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly getAvailableSlots: GetAvailableSlotsUseCase,
  ) {}

  @Get("available-slots")
  @ApiOkResponse({ description: "Available appointment slots." })
  getSlots(
    @Query(new ZodValidationPipe(getAvailableSlotsQuerySchema))
    query: GetAvailableSlotsQuery,
  ): Promise<AvailableSlotsDto> {
    return this.getAvailableSlots.execute(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "client")
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: "Appointment created." })
  create(
    @Body(new ZodValidationPipe(createAppointmentSchema))
    input: CreateAppointmentInput,
  ): Promise<AppointmentDto> {
    return this.createAppointment.execute({
      customerId: input.customerId,
      petId: input.petId,
      petWeightKg: input.petWeightKg,
      service: input.service,
      startsAt: new Date(input.startsAt),
      ...(input.notes ? { notes: input.notes } : {}),
    });
  }
}
