export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPetWeightError extends DomainError {}
export class AppointmentConflictError extends DomainError {}
export class AppointmentInPastError extends DomainError {}
