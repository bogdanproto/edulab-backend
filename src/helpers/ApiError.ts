import { ApiErrorParams, ErrorStatus } from '../types';

export default class ApiError extends Error {
  public declare status: ErrorStatus;
  public statusCode: number;
  public errorDetail?: unknown;
  public refreshToken?: string | null;

  constructor({
    statusCode,
    message,
    errorDetail = null,
    status,
    refreshToken = null,
  }: ApiErrorParams) {
    super(message);
    if (!status) {
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    } else {
      this.status = status;
    }
    this.statusCode = statusCode;
    this.errorDetail = errorDetail;
    this.refreshToken = refreshToken;
    Error.captureStackTrace(this, this.constructor);
  }
}
