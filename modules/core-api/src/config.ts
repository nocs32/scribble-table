import { fileURLToPath } from 'node:url';

export interface Config {
  port: number;
}

// 2568, not Colyseus's usual 2567: Felt Table's core-api uses that, and both may run at once.
const defaultPort = 2568;

// modules/core-api/.env (see .env.example). It is optional: real environment variables work too.
const loadEnvFile = (): void => {
  try {
    process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
  } catch (error) {
    const missing = error instanceof Error && 'code' in error && error.code === 'ENOENT';

    if (!missing) {
      throw error;
    }
  }
};

const readPort = (value: string | undefined): number => {
  const port = Number(value ?? defaultPort);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`CORE_API_PORT must be a positive integer, got "${value}"`);
  }

  return port;
};

loadEnvFile();

// CORE_API_PORT, not PORT: tools that start the whole workspace often set PORT for the web dev server.
export const config: Config = {
  port: readPort(process.env.CORE_API_PORT),
};
