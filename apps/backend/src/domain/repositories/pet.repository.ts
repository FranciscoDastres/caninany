export const PET_REPOSITORY = Symbol("PET_REPOSITORY");

export interface PetRecord {
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
  weightKg: number;
}

export interface SavePetRecord {
  behaviorNotes: string | null;
  breed: string | null;
  dateOfBirth: Date | null;
  medicalNotes: string | null;
  name: string;
  weightKg: number;
}

export interface CreatePetRecord extends SavePetRecord {
  id: string;
  ownerId: string;
}

export interface PetRepository {
  archive(id: string): Promise<PetRecord>;
  create(input: CreatePetRecord): Promise<PetRecord>;
  findActiveByOwnerId(ownerId: string): Promise<PetRecord[]>;
  findById(id: string): Promise<PetRecord | null>;
  update(id: string, input: SavePetRecord): Promise<PetRecord>;
}
