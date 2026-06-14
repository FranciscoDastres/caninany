import { Injectable } from "@nestjs/common";

import { Appointment } from "../../../../domain/entities/appointment.entity";
import { AppointmentConflictError } from "../../../../domain/errors/domain.error";
import type { AppointmentRepository } from "../../../../domain/repositories/appointment.repository";
import type { Appointment as PrismaAppointment } from "../../../../generated/prisma/client";
import { PrismaService } from "../prisma.service";

const serviceToPersistence = {
  bath: "BATH",
  "ear-cleaning": "EAR_CLEANING",
  "bath-and-ear-cleaning": "BATH_AND_EAR_CLEANING",
} as const;

const serviceToDomain = {
  BATH: "bath",
  EAR_CLEANING: "ear-cleaning",
  BATH_AND_EAR_CLEANING: "bath-and-ear-cleaning",
} as const;

const statusToPersistence = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
} as const;

const statusToDomain = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOverlapping(startsAt: Date, endsAt: Date): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    return records.map((record) => this.toDomain(record));
  }

  async save(appointment: Appointment): Promise<void> {
    const requester = appointment.publicRequester;

    try {
      await this.prisma.appointment.create({
        data: {
          id: appointment.id,
          ...(appointment.customerId
            ? { customerId: appointment.customerId }
            : {}),
          ...(appointment.petId ? { petId: appointment.petId } : {}),
          ...(requester
            ? {
                ownerName: requester.ownerName,
                phone: requester.phone,
                ...(requester.email ? { email: requester.email } : {}),
                petName: requester.petName,
                petWeightKg: requester.petWeightKg,
              }
            : {}),
          service: serviceToPersistence[appointment.service],
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          durationMinutes: appointment.durationMinutes,
          status: statusToPersistence[appointment.status],
          ...(appointment.notes ? { notes: appointment.notes } : {}),
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        (("code" in error && error.code === "P2004") ||
          ("message" in error &&
            typeof error.message === "string" &&
            error.message.includes("Appointment_no_overlapping_active_slots")))
      ) {
        throw new AppointmentConflictError(
          "La hora acaba de ser tomada. Selecciona otro bloque disponible.",
        );
      }
      throw error;
    }
  }

  private toDomain(record: PrismaAppointment): Appointment {
    const hasPublicRequester = Boolean(
      record.ownerName &&
      record.phone &&
      record.petName &&
      record.petWeightKg !== null,
    );

    return Appointment.restore({
      id: record.id,
      ...(record.customerId ? { customerId: record.customerId } : {}),
      ...(record.petId ? { petId: record.petId } : {}),
      ...(hasPublicRequester
        ? {
            publicRequester: {
              ownerName: record.ownerName!,
              phone: record.phone!,
              ...(record.email ? { email: record.email } : {}),
              petName: record.petName!,
              petWeightKg: Number(record.petWeightKg),
            },
          }
        : {}),
      service: serviceToDomain[record.service],
      startsAt: record.startsAt,
      durationMinutes: record.durationMinutes,
      status: statusToDomain[record.status],
      ...(record.notes ? { notes: record.notes } : {}),
      createdAt: record.createdAt,
    });
  }
}
