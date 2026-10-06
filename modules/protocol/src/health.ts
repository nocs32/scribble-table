// GET /api/health: answers while core-api is up.
export interface HealthResponse {
  ok: true;
  // Seconds since core-api started.
  uptime: number;
}
