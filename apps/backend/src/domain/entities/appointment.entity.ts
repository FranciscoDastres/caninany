import type { AppointmentService } from "@caninany/shared";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface PublicAppointmentRequester {
  ownerName: string;
  phone: string;
  email?: string;
  petName: string;
  petWeightKg: number;
}

export interface AppointmentProps {
  id: string;
  customerId?: string;
  petId?: string;
  publicRequester?: PublicAppointmentRequester;
  service: AppointmentService;
  startsAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
}

export class Appointment {
  private constructor(private readonly props: AppointmentProps) {}

  static create(
    props: Omit<AppointmentProps, "status" | "createdAt"> &
      Partial<Pick<AppointmentProps, "status" | "createdAt">>,
  ): Appointment {
    const hasAnyRegisteredRequester = Boolean(props.customerId || props.petId);
    const hasRegisteredRequester = Boolean(props.customerId && props.petId);
    const hasPublicRequester = Boolean(props.publicRequester);
    const hasValidRegisteredRequester =
      hasRegisteredRequester && !hasPublicRequester;
    const hasValidPublicRequester =
      !hasAnyRegisteredRequester && hasPublicRequester;

    if (!hasValidRegisteredRequester && !hasValidPublicRequester) {
      throw new Error(
        "An appointment requires exactly one complete requester type.",
      );
    }

    return new Appointment({
      ...props,
      status: props.status ?? "pending",
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string | undefined {
    return this.props.customerId;
  }

  get petId(): string | undefined {
    return this.props.petId;
  }

  get publicRequester(): PublicAppointmentRequester | undefined {
    return this.props.publicRequester
      ? { ...this.props.publicRequester }
      : undefined;
  }

  get service(): AppointmentService {
    return this.props.service;
  }

  get startsAt(): Date {
    return new Date(this.props.startsAt);
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }

  get endsAt(): Date {
    return new Date(
      this.props.startsAt.getTime() + this.props.durationMinutes * 60_000,
    );
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }
}
