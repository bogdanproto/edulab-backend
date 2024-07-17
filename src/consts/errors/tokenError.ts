import { ApiErrorParams } from '../../types';

const tokenError = {
  ACCESS_EXPIRED: {
    statusCode: 401,
    message: 'Access token has expired',
    status: 'token_error',
  } satisfies ApiErrorParams,

  REFRESH_EXPIRED: {
    statusCode: 401,
    message: 'Refresh token has expired',
    status: 'token_error',
  } satisfies ApiErrorParams,

  INVALID: {
    statusCode: 401,
    message: 'Invalid token',
    status: 'token_error',
  } satisfies ApiErrorParams,
};

export default tokenError;
