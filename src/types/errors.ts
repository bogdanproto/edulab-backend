export type IPgError = Error & {
  severity: string;
  detail: string;
};

export type ErrorStatus = 'fail' | 'error' | 'pg_error' | 'token_error';

export type ApiErrorParams = {
  statusCode: number;
  message: string;
  errorDetail?: unknown;
  status?: ErrorStatus;
  refreshToken?: string | null;
};
