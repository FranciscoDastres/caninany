export const PET_WEIGHT_LIMITS = {
  minKg: 0.5,
  smallMaxKg: 10,
  mediumMaxKg: 25,
  maxKg: 100,
} as const;

export type PetSize = "small" | "medium" | "large";
