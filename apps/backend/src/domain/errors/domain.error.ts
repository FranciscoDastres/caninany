export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPetWeightError extends DomainError {}
export class AppointmentConflictError extends DomainError {}
export class AppointmentInPastError extends DomainError {}
export class AppointmentNotFoundError extends DomainError {}
export class AppointmentOutsideBusinessHoursError extends DomainError {}
export class EmailAlreadyRegisteredError extends DomainError {}
export class InvalidCredentialsError extends DomainError {}
export class AccountSuspendedError extends DomainError {}
export class EmailNotVerifiedError extends DomainError {}
export class InvalidActionTokenError extends DomainError {}
export class InvalidGoogleTokenError extends DomainError {}
export class GoogleUnavailableError extends DomainError {}
export class GoogleLinkRequiredError extends DomainError {}
export class LastLoginMethodError extends DomainError {}
export class InvalidRefreshTokenError extends DomainError {}
export class UserNotFoundError extends DomainError {}
export class CannotChangeOwnRoleError extends DomainError {}
export class PetNotFoundError extends DomainError {}
