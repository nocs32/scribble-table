// Error codes for core-api's HTTP endpoints. Every non-2xx JSON response has the `ApiError` shape.
// Statuses: INVALID_REQUEST 400, NOT_FOUND 404, SERVER_ERROR 500.
export type ApiErrorCode = 'INVALID_REQUEST' | 'NOT_FOUND' | 'SERVER_ERROR';

export interface ApiError {
  error: ApiErrorCode;
  // Human-readable, safe to show to the user.
  message: string;
}
