import type { AppointmentService } from "@caninany/shared";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface AppointmentProps {
  id: string;
  customerId: string;
  petId: string;
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
    return new Appointment({
      ...props,
      status: props.status ?? "pending",
      createdAt: props.createdAt ?? new Date(),
    });
  }

  static restore(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get petId(): string {
    return this.props.petId;
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
