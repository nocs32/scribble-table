import type { HealthResponse } from '@scribble-table/protocol';
import { Router } from 'express';

export const healthRouter: Router = Router();

healthRouter.get('/', (_request, response) => {
  const body: HealthResponse = { ok: true, uptime: process.uptime() };

  response.json(body);
});
