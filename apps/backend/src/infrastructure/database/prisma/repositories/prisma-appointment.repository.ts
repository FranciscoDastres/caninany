import { Injectable } from "@nestjs/common";

import {
  Appointment,
  type AppointmentStatus,
} from "../../../../domain/entities/appointment.entity";
import { AppointmentConflictError } from "../../../../domain/errors/domain.error";
import type {
  AdminAppointmentRecord,
  AppointmentBusyPeriod,
  CustomerAppointmentRecord,
  AppointmentRepository,
} from "../../../../domain/repositories/appointment.repository";
import { PrismaService } from "../prisma.service";

const serviceToPersistence = {
  bath: "BATH",
  "ear-cleaning": "EAR_CLEANING",
  "bath-and-ear-cleaning": "BATH_AND_EAR_CLEANING",
} as const;

const statusToPersistence = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
} as const;

const serviceFromPersistence = {
  BATH: "bath",
  EAR_CLEANING: "ear-cleaning",
  BATH_AND_EAR_CLEANING: "bath-and-ear-cleaning",
} as const;

const statusFromPersistence = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

interface AdminAppointmentPersistence {
  createdAt: Date;
  customer: {
    email: string;
    name: string;
    phone: string | null;
  } | null;
  customerId: string | null;
  durationMinutes: number;
  email: string | null;
  endsAt: Date;
  id: string;
  notes: string | null;
  ownerName: string | null;
  pet: {
    name: string;
    weightKg: { toString(): string } | number;
  } | null;
  petId: string | null;
  petName: string | null;
  petWeightKg: { toString(): string } | number | null;
  phone: string | null;
  service: keyof typeof serviceFromPersistence;
  startsAt: Date;
  status: keyof typeof statusFromPersistence;
}

const adminAppointmentSelect = {
  id: true,
  customerId: true,
  customer: { select: { name: true, email: true, phone: true } },
  petId: true,
  pet: { select: { name: true, weightKg: true } },
  ownerName: true,
  phone: true,
  email: true,
  petName: true,
  petWeightKg: true,
  service: true,
  startsAt: true,
  endsAt: true,
  durationMinutes: true,
  status: true,
  notes: true,
  createdAt: true,
} as const;

function decimalToNumber(
  value: { toString(): string } | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value.toString());
}

@Injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBusyPeriods(
    startsAt: Date,
    endsAt: Date,
  ): Promise<AppointmentBusyPeriod[]> {
    return this.prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      orderBy: { startsAt: "asc" },
      select: {
        startsAt: true,
        endsAt: true,
      },
    });
  }

  async hasActiveOverlap(startsAt: Date, endsAt: Date): Promise<boolean> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      select: { id: true },
    });

    return appointment !== null;
  }

  async listForAdmin(): Promise<AdminAppointmentRecord[]> {
    const appointments = await this.prisma.appointment.findMany({
      orderBy: { startsAt: "desc" },
      select: adminAppointmentSelect,
    });

    return appointments.map((appointment) =>
      this.toAdminAppointmentRecord(appointment),
    );
  }

  async listByCustomer(
    customerId: string,
  ): Promise<CustomerAppointmentRecord[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { customerId },
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        customerId: true,
        petId: true,
        pet: { select: { name: true } },
        service: true,
        startsAt: true,
        endsAt: true,
        durationMinutes: true,
        status: true,
        notes: true,
      },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      customerId: appointment.customerId,
      petId: appointment.petId,
      petName: appointment.pet?.name ?? null,
      service: serviceFromPersistence[appointment.service],
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      durationMinutes: appointment.durationMinutes,
      status: statusFromPersistence[appointment.status],
      notes: appointment.notes,
    }));
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

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<AdminAppointmentRecord | null> {
    try {
      const appointment = await this.prisma.appointment.update({
        where: { id },
        data: { status: statusToPersistence[status] },
        select: adminAppointmentSelect,
      });

      return this.toAdminAppointmentRecord(appointment);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
      ) {
        return null;
      }
      throw error;
    }
  }

  private toAdminAppointmentRecord(
    appointment: AdminAppointmentPersistence,
  ): AdminAppointmentRecord {
    return {
      id: appointment.id,
      customerId: appointment.customerId,
      customerName: appointment.customer?.name ?? null,
      customerEmail: appointment.customer?.email ?? null,
      customerPhone: appointment.customer?.phone ?? null,
      ownerName: appointment.ownerName,
      ownerEmail: appointment.email,
      ownerPhone: appointment.phone,
      petId: appointment.petId,
      petName: appointment.pet?.name ?? appointment.petName,
      petWeightKg: decimalToNumber(
        appointment.petWeightKg ?? appointment.pet?.weightKg,
      ),
      service: serviceFromPersistence[appointment.service],
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      durationMinutes: appointment.durationMinutes,
      status: statusFromPersistence[appointment.status],
      notes: appointment.notes,
      createdAt: appointment.createdAt,
    };
  }
}
