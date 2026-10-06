import type { ApiError, ApiErrorCode } from '@scribble-table/protocol';

const statusByCode: Record<ApiErrorCode, number> = {
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Thrown anywhere in a request; errorMiddleware turns it into an `ApiError` JSON response.
// The message is sent to the client, so it must never contain secrets or upstream details.
export class ApiErrorException extends Error {
  readonly code: ApiErrorCode;

  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiErrorException';
    this.code = code;
    this.status = statusByCode[code];
  }

  toJson(): ApiError {
    return { error: this.code, message: this.message };
  }
}
