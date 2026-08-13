import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Logout (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: { user: { findUnique: jest.Mock }; refreshToken: { create: jest.Mock; deleteMany: jest.Mock } };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        deleteMany: jest.fn(),
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

  it('POST /api/v1/auth/logout - should revoke all user refresh tokens and return 200', async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = {
      id: 'e2e-user-id-1',
      username: 'streaker_e2e_1',
      passwordHash,
      createdAt: new Date('2026-08-13T12:00:00.000Z'),
    };
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.refreshToken.create.mockResolvedValue({});
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'streaker_e2e_1', password: 'Password123' });

    const accessToken = loginRes.body.data.tokens.accessToken;

    const logoutRes = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(logoutRes.body.success).toBe(true);
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'e2e-user-id-1' },
    });
  });
});
