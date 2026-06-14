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
  CannotChangeOwnRoleError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidPetWeightError,
  UserNotFoundError,
} from "../../domain/errors/domain.error";

@Catch(
  AppointmentConflictError,
  AppointmentInPastError,
  InvalidPetWeightError,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  UserNotFoundError,
  CannotChangeOwnRoleError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | AppointmentConflictError
      | AppointmentInPastError
      | InvalidPetWeightError
      | EmailAlreadyRegisteredError
      | InvalidCredentialsError
      | UserNotFoundError
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
          : exception instanceof UserNotFoundError
            ? new NotFoundException(exception.message)
            : exception instanceof CannotChangeOwnRoleError
              ? new BadRequestException(exception.message)
              : new UnprocessableEntityException(exception.message);

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
