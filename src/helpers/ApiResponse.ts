import { Context } from 'koa';
import ApiError from './ApiError';
import { IPgError } from '../types';
import { setRefreshTokenCookie } from '../helpers';

interface ISuccessResponse {
  status: number;
  message?: string;
  data?: unknown;
}

export default class ApiResponse {
  static success(ctx: Context, { status, message, data }: ISuccessResponse) {
    ctx.status = status;
    ctx.body = {
      status: 'success',
      message,
      data,
    };
  }

  static error(ctx: Context, error: ApiError) {
    ctx.status = error.statusCode;
    ctx.body = {
      status: error.status,
      message: error.message,
      errorDetail: error.errorDetail,
    };
    if (error.refreshToken) {
      setRefreshTokenCookie(ctx, error.refreshToken);
    }
  }

  static pgError(ctx: Context, error: IPgError) {
    const apiError = new ApiError({
      statusCode: 400,
      message: error.detail,
      status: 'pg_error',
      errorDetail: error,
    });

    ApiResponse.error(ctx, apiError);
  }

  static unknownError(ctx: Context, error: unknown) {
    const apiError = new ApiError({
      statusCode: 500,
      message: 'An unknown error occured',
      status: 'error',
      errorDetail: error,
    });

    ApiResponse.error(ctx, apiError);
  }

  static pageNotFoundError(ctx: Context) {
    const apiError = new ApiError({
      statusCode: 404,
      message: 'No route found',
      status: 'error',
    });

    ApiResponse.error(ctx, apiError);
  }
}
