import { Injectable } from "@nestjs/common";

import { Appointment } from "../../../../domain/entities/appointment.entity";
import type { AppointmentRepository } from "../../../../domain/repositories/appointment.repository";
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

  async findBetween(startsAt: Date, endsAt: Date): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        startsAt: { gte: startsAt, lte: endsAt },
        status: { not: "CANCELLED" },
      },
      orderBy: { startsAt: "asc" },
    });

    return records.map((record) =>
      Appointment.restore({
        id: record.id,
        customerId: record.customerId,
        petId: record.petId,
        service: serviceToDomain[record.service],
        startsAt: record.startsAt,
        durationMinutes: record.durationMinutes,
        status: statusToDomain[record.status],
        ...(record.notes ? { notes: record.notes } : {}),
        createdAt: record.createdAt,
      }),
    );
  }

  async findOverlapping(startsAt: Date, endsAt: Date): Promise<Appointment[]> {
    const records = await this.prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    return records.map((record) =>
      Appointment.restore({
        id: record.id,
        customerId: record.customerId,
        petId: record.petId,
        service: serviceToDomain[record.service],
        startsAt: record.startsAt,
        durationMinutes: record.durationMinutes,
        status: statusToDomain[record.status],
        ...(record.notes ? { notes: record.notes } : {}),
        createdAt: record.createdAt,
      }),
    );
  }

  async save(appointment: Appointment): Promise<void> {
    await this.prisma.appointment.create({
      data: {
        id: appointment.id,
        customerId: appointment.customerId,
        petId: appointment.petId,
        service: serviceToPersistence[appointment.service],
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        durationMinutes: appointment.durationMinutes,
        status: statusToPersistence[appointment.status],
        ...(appointment.notes ? { notes: appointment.notes } : {}),
      },
    });
  }
}
