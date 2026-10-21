import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

export function getAllowedOrigins(): string[] {
  const rawOrigins = [
    ...(process.env.CORS_ORIGINS?.split(',') ?? []),
    ...(process.env.CLIENT_URL?.split(',') ?? []),
  ];

  return rawOrigins.map((origin) => origin.trim()).filter(Boolean);
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[] = getAllowedOrigins(),
): boolean {
  // 1. Requests with no origin (server-to-server, curl, health checks)
  if (!origin) {
    return true;
  }

  // 2. Any origin explicitly listed in CORS_ORIGINS or CLIENT_URL (comma separated)
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // 3. Any https://*.vercel.app domain (regex /\.vercel\.app$/)
  if (
    origin.startsWith('https://') &&
    (origin === 'https://vercel.app' || /\.vercel\.app$/.test(origin))
  ) {
    return true;
  }

  // 4. Any chrome-extension:// origin (future extension support)
  if (origin.startsWith('chrome-extension://')) {
    return true;
  }

  // 5. http://localhost:* for local development
  if (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  ) {
    return true;
  }

  return false;
}

export function getCorsOptions(allowedOrigins: string[] = getAllowedOrigins()) {
  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    exposedHeaders: ['ETag'],
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust reverse proxies (Render, Railway, Cloudflare) for secure cookies
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());

  const allowedOrigins = getAllowedOrigins();

  app.enableCors(getCorsOptions(allowedOrigins));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}
