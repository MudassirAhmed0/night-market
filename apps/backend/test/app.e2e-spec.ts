import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { makePrismaMock } from './prisma.mock';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';

describe('E2E HTTP', () => {
  let app: NestExpressApplication;
  beforeAll(async () => {
    const moduleRef = Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(makePrismaMock())
      .compile();

    app = (await moduleRef).createNestApplication();
    app.use(helmet());
    app.use(compression());
    app.set('etag', 'strong');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.init();
  });
  afterAll(async () => {
    app.close();
  });

  it('/events (GET) basic list', async () => {
    const res = await request(app.getHttpServer()).get('/events').expect(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.headers).toHaveProperty('etag');
    expect(res.headers['cache-control']).toBeDefined();
  });
  it('/events (GET) with pagination & filteration', async () => {
    const res = await request(app.getHttpServer())
      .get('/events')
      .query({
        city: 'barcelona',
        category: 'techno',
        from: '2025-09-01',
        to: '2025-10-31',
        page: 1,
        pageSize: 5,
        sort: 'startAt',
        order: 'asc',
      })
      .expect(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(5);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.items[0].city.slug).toBe('barcelona');
  });
  it('/events/:id (GET) not found -> 404', async () => {
    const res1 = await request(app.getHttpServer()).get('/events/nope').expect(400); // fails ValidationPipe before controller (id length/format) ;
    const res2 = await request(app.getHttpServer()).get('/events/aaaaaaaaaa').expect(404);
    expect(res2.body.error.status).toBe(404);
  });
  it('/events/:id (GET) success', async () => {});
  it('/venues/:id (GET) success', async () => {
    const res = await request(app.getHttpServer()).get('/venues/v12345678911').expect(200);

    expect(res.body.slug).toBe('la-terraza');
  });
});
