import {
  ArgumentsHost,
  Catch,
  ConflictException,
  type ExceptionFilter,
  UnprocessableEntityException,
} from "@nestjs/common";

import {
  AppointmentConflictError,
  AppointmentInPastError,
  InvalidPetWeightError,
} from "../../domain/errors/domain.error";

@Catch(AppointmentConflictError, AppointmentInPastError, InvalidPetWeightError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | AppointmentConflictError
      | AppointmentInPastError
      | InvalidPetWeightError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse();
    const httpException =
      exception instanceof AppointmentConflictError
        ? new ConflictException(exception.message)
        : new UnprocessableEntityException(exception.message);

    response
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }
}
