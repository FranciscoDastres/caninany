import { Injectable } from "@nestjs/common";

import type {
  CreatePetRecord,
  PetRecord,
  PetRepository,
  SavePetRecord,
} from "../../../../domain/repositories/pet.repository";
import { PrismaService } from "../prisma.service";

const petSelect = {
  id: true,
  ownerId: true,
  name: true,
  breed: true,
  weightKg: true,
  dateOfBirth: true,
  medicalNotes: true,
  behaviorNotes: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PrismaPetRepository implements PetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByOwnerId(ownerId: string): Promise<PetRecord[]> {
    return (
      await this.prisma.pet.findMany({
        where: { ownerId, archivedAt: null },
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        select: petSelect,
      })
    ).map((pet) => this.toDomain(pet));
  }

  async findById(id: string): Promise<PetRecord | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      select: petSelect,
    });
    return pet ? this.toDomain(pet) : null;
  }

  async create(input: CreatePetRecord): Promise<PetRecord> {
    return this.toDomain(
      await this.prisma.pet.create({
        data: input,
        select: petSelect,
      }),
    );
  }

  async update(id: string, input: SavePetRecord): Promise<PetRecord> {
    return this.toDomain(
      await this.prisma.pet.update({
        where: { id },
        data: input,
        select: petSelect,
      }),
    );
  }

  async archive(id: string): Promise<PetRecord> {
    return this.toDomain(
      await this.prisma.pet.update({
        where: { id },
        data: { archivedAt: new Date() },
        select: petSelect,
      }),
    );
  }

  private toDomain(pet: {
    archivedAt: Date | null;
    behaviorNotes: string | null;
    breed: string | null;
    createdAt: Date;
    dateOfBirth: Date | null;
    id: string;
    medicalNotes: string | null;
    name: string;
    ownerId: string;
    updatedAt: Date;
    weightKg: { toString(): string };
  }): PetRecord {
    return {
      ...pet,
      weightKg: Number(pet.weightKg),
    };
  }
}
