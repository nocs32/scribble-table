import type { HealthResponse } from '@scribble-table/protocol';
import type { HealthApiService } from './types';

const isHealthy = (body: unknown): body is HealthResponse =>
  typeof body === 'object' && body !== null && 'ok' in body && body.ok === true;

export const createHealthApi = (): HealthApiService => ({
  isUp: async () => {
    try {
      const response = await fetch('/api/health');

      return response.ok && isHealthy(await response.json());
    } catch {
      return false;
    }
  },
});
