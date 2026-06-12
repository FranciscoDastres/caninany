import { PET_WEIGHT_LIMITS, type PetSize } from "@caninany/shared";

import { InvalidPetWeightError } from "../errors/domain.error";

export class PetWeight {
  private constructor(public readonly kilograms: number) {}

  static create(kilograms: number): PetWeight {
    if (
      !Number.isFinite(kilograms) ||
      kilograms < PET_WEIGHT_LIMITS.minKg ||
      kilograms > PET_WEIGHT_LIMITS.maxKg
    ) {
      throw new InvalidPetWeightError(
        `Pet weight must be between ${PET_WEIGHT_LIMITS.minKg} and ${PET_WEIGHT_LIMITS.maxKg} kg.`,
      );
    }

    return new PetWeight(kilograms);
  }

  get size(): PetSize {
    if (this.kilograms <= PET_WEIGHT_LIMITS.smallMaxKg) {
      return "small";
    }

    if (this.kilograms <= PET_WEIGHT_LIMITS.mediumMaxKg) {
      return "medium";
    }

    return "large";
  }
}
