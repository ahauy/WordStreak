import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Registration (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: { user: { findUnique: jest.Mock; create: jest.Mock }; refreshToken: { create: jest.Mock } };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
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

  it('POST /api/v1/auth/register - should create user and return 201 with auth tokens', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'e2e-user-id-1',
      username: 'streaker_e2e_1',
      createdAt: new Date('2026-08-13T12:00:00.000Z'),
    });
    prismaMock.refreshToken.create.mockResolvedValue({});

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ username: 'streaker_e2e_1', password: 'Password123' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.username).toBe('streaker_e2e_1');
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.tokenType).toBe('Bearer');
  });

  it('POST /api/v1/auth/register - should return 400 Bad Request on password shorter than 8 chars', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ username: 'valid_user', password: 'short' })
      .expect(400);
  });

  it('POST /api/v1/auth/register - should return 409 Conflict if username taken', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-id', username: 'duplicate_user' });

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ username: 'duplicate_user', password: 'Password123' })
      .expect(409);

    expect(response.body.message || response.body.error).toBeDefined();
  });
});
