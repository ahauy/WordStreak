import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Login & Profile (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: { user: { findUnique: jest.Mock }; refreshToken: { create: jest.Mock } };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
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

  it('POST /api/v1/auth/login - should authenticate user and return 200 with tokens', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'e2e-user-id-1',
      username: 'streaker_e2e_1',
      passwordHash,
      createdAt: new Date('2026-08-13T12:00:00.000Z'),
    });
    prismaMock.refreshToken.create.mockResolvedValue({});

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'streaker_e2e_1', password: 'Password123' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.username).toBe('streaker_e2e_1');
    expect(response.body.data.tokens.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/login - should return 401 Unauthorized on invalid password', async () => {
    const passwordHash = await bcrypt.hash('CorrectPassword', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'e2e-user-id-1',
      username: 'streaker_e2e_1',
      passwordHash,
    });

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'streaker_e2e_1', password: 'WrongPassword' })
      .expect(401);
  });

  it('GET /api/v1/auth/me - should return protected profile with valid Bearer token', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = {
      id: 'e2e-user-id-1',
      username: 'streaker_e2e_1',
      passwordHash,
      createdAt: new Date('2026-08-13T12:00:00.000Z'),
    };
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.refreshToken.create.mockResolvedValue({});

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'streaker_e2e_1', password: 'Password123' });

    const accessToken = loginRes.body.data.tokens.accessToken;

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.username).toBe('streaker_e2e_1');
  });
});
