import { registerAs } from '@nestjs/config';

const DEFAULT_PORT = 3000;

export const appConfig = registerAs('app', () => {
  const parsedPort = Number(process.env.PORT);

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port:
      Number.isInteger(parsedPort) && parsedPort > 0
        ? parsedPort
        : DEFAULT_PORT,
  };
});
