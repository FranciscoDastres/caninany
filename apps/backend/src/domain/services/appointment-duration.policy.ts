import type { AppointmentService } from "@caninany/shared";

import type { PetWeight } from "../value-objects/pet-weight";

const SERVICE_BASE_MINUTES: Record<AppointmentService, number> = {
  bath: 45,
  "ear-cleaning": 20,
  "bath-and-ear-cleaning": 60,
};

const SIZE_EXTRA_MINUTES = {
  small: 0,
  medium: 15,
  large: 30,
} as const;

export class AppointmentDurationPolicy {
  static calculate(service: AppointmentService, petWeight: PetWeight): number {
    return SERVICE_BASE_MINUTES[service] + SIZE_EXTRA_MINUTES[petWeight.size];
  }
}
