import { Next, Context } from 'koa';
import { ApiError, ApiResponse } from '../helpers';
import { IPgError } from '../types';

const handleErrors = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.log('🚀 ~ handleErrors ~ error:', error);
    if (error instanceof ApiError) {
      ApiResponse.error(ctx, error);
    } else if (
      error instanceof Error &&
      (error as IPgError).severity === 'ERROR'
    ) {
      ApiResponse.pgError(ctx, error as IPgError);
    } else {
      ApiResponse.unknownError(ctx, error);
    }
  }
};

export default handleErrors;
