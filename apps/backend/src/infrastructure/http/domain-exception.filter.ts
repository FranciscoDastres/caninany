import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  type ExceptionFilter,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";

import {
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentOutsideBusinessHoursError,
  CannotChangeOwnRoleError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidPetWeightError,
  PetNotFoundError,
  UserNotFoundError,
} from "../../domain/errors/domain.error";

@Catch(
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentOutsideBusinessHoursError,
  InvalidPetWeightError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  UserNotFoundError,
  PetNotFoundError,
  CannotChangeOwnRoleError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | AppointmentConflictError
      | AppointmentInPastError
      | AppointmentOutsideBusinessHoursError
      | InvalidPetWeightError
      | EmailAlreadyRegisteredError
      | InvalidCredentialsError
      | UserNotFoundError
      | PetNotFoundError
      | CannotChangeOwnRoleError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse();
    const httpException =
      exception instanceof AppointmentConflictError ||
      exception instanceof EmailAlreadyRegisteredError
        ? new ConflictException(exception.message)
        : exception instanceof InvalidCredentialsError
          ? new UnauthorizedException(exception.message)
          : exception instanceof UserNotFoundError ||
              exception instanceof PetNotFoundError
            ? new NotFoundException(exception.message)
            : exception instanceof CannotChangeOwnRoleError
              ? new BadRequestException(exception.message)
              : new UnprocessableEntityException(exception.message);

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
