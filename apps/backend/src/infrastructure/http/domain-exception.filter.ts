import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  type ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";

import {
  AccountSuspendedError,
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentNotFoundError,
  AppointmentOutsideBusinessHoursError,
  CannotChangeOwnRoleError,
  EmailAlreadyRegisteredError,
  EmailNotVerifiedError,
  GoogleLinkRequiredError,
  GoogleUnavailableError,
  InvalidActionTokenError,
  InvalidGoogleTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidPetWeightError,
  LastLoginMethodError,
  PetNotFoundError,
  UserNotFoundError,
} from "../../domain/errors/domain.error";

@Catch(
  AppointmentConflictError,
  AppointmentInPastError,
  AppointmentNotFoundError,
  AppointmentOutsideBusinessHoursError,
  InvalidPetWeightError,
  EmailAlreadyRegisteredError,
  EmailNotVerifiedError,
  GoogleLinkRequiredError,
  GoogleUnavailableError,
  InvalidActionTokenError,
  InvalidGoogleTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  LastLoginMethodError,
  AccountSuspendedError,
  UserNotFoundError,
  PetNotFoundError,
  CannotChangeOwnRoleError,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | AppointmentConflictError
      | AppointmentInPastError
      | AppointmentNotFoundError
      | AppointmentOutsideBusinessHoursError
      | InvalidPetWeightError
      | EmailAlreadyRegisteredError
      | EmailNotVerifiedError
      | GoogleLinkRequiredError
      | GoogleUnavailableError
      | InvalidActionTokenError
      | InvalidGoogleTokenError
      | InvalidCredentialsError
      | InvalidRefreshTokenError
      | LastLoginMethodError
      | AccountSuspendedError
      | UserNotFoundError
      | PetNotFoundError
      | CannotChangeOwnRoleError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse();
    if (exception instanceof GoogleLinkRequiredError) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        code: "GOOGLE_LINK_REQUIRED",
        message: exception.message,
      });
      return;
    }

    const httpException =
      exception instanceof AppointmentConflictError ||
      exception instanceof EmailAlreadyRegisteredError
        ? new ConflictException(exception.message)
        : exception instanceof EmailNotVerifiedError
          ? new ForbiddenException(exception.message)
          : exception instanceof GoogleUnavailableError
            ? new HttpException(
                exception.message,
                HttpStatus.SERVICE_UNAVAILABLE,
              )
            : exception instanceof InvalidCredentialsError ||
                exception instanceof InvalidRefreshTokenError ||
                exception instanceof InvalidGoogleTokenError ||
                exception instanceof AccountSuspendedError
              ? new UnauthorizedException(exception.message)
              : exception instanceof UserNotFoundError ||
                  exception instanceof PetNotFoundError ||
                  exception instanceof AppointmentNotFoundError
                ? new NotFoundException(exception.message)
                : exception instanceof CannotChangeOwnRoleError
                  ? new BadRequestException(exception.message)
                  : new UnprocessableEntityException(exception.message);

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
