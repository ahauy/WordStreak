import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Token Refresh (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: { refreshToken: { findUnique: jest.Mock; delete: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prismaMock = {
      refreshToken: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/refresh - should exchange valid refresh token for new tokens', async () => {
    const rawToken = '7d9e8f7a-6b5c-4d3e-2f1a-0b9c8d7e6f5a';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 'token-db-id-1',
      userId: 'e2e-user-id-1',
      tokenHash,
      expiresAt: new Date(Date.now() + 100000),
      user: {
        id: 'e2e-user-id-1',
        username: 'streaker_e2e_1',
        createdAt: new Date('2026-08-13T12:00:00.000Z'),
      },
    });
    prismaMock.refreshToken.delete.mockResolvedValue({});
    prismaMock.refreshToken.create.mockResolvedValue({});

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rawToken })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/refresh - should return 401 Unauthorized on non-existent refresh token', async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });
});
