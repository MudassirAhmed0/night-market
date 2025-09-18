// apps/backend/test/app.e2e-spec.ts
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { makePrismaMock } from './prisma.mock';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import request, { Response } from 'supertest';

// Narrow response shapes so we don't touch `any`
interface EventListItem {
  id: string;
  city: { slug: string };
  slug?: string;
}

interface EventsListResponse {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
}

interface ErrorResponse {
  statusCode: number;
}

interface EventResponse {
  id: string;
  slug: string;
}

describe('E2E HTTP', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(makePrismaMock())
      .compile();

    app = moduleRef.createNestApplication();
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

    // actually await the init
    await app.init();
  });

  afterAll(async () => {
    // and actually await the close
    await app.close();
  });

  it('/events (GET) basic list', async () => {
    const res: Response = await request(app.getHttpServer()).get('/events').expect(200);

    const body = res.body as EventsListResponse;
    expect(body.items.length).toBeGreaterThan(0);

    // headers are fine to access on supertest Response
    expect(res.headers).toHaveProperty('etag');
    expect(res.headers['cache-control']).toBeDefined();
  });

  it('/events (GET) with pagination & filtration', async () => {
    const res: Response = await request(app.getHttpServer())
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

    const body = res.body as EventsListResponse;
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(5);
    expect(body.total).toBeGreaterThan(0);
    expect(body.items[0].city.slug).toBe('barcelona');
  });

  it('/events/:id (GET) not found -> 404', async () => {
    // lint: don't keep an unused var; await the promise so it isn’t "floating"
    await request(app.getHttpServer()).get('/events/nope').expect(400); // ValidationPipe hits first

    const res2: Response = await request(app.getHttpServer()).get('/events/aaaaaaaaaa').expect(404);
    const body2 = res2.body as ErrorResponse;

    expect(body2.statusCode).toBe(404);
  });

  it('/events/:id (GET) success', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/events/e12345678911')
      .expect(200);

    const body = res.body as EventResponse;
    expect(body.id).toBe('e12345678911');
    expect(body.slug).toBe('neon-nights');
  });

  it('/venues/:id (GET) success', async () => {
    const res: Response = await request(app.getHttpServer())
      .get('/venues/v12345678911')
      .expect(200);

    // venue shape isn’t strictly typed here, but we only touch known fields
    const body = res.body as { slug: string };
    expect(body.slug).toBe('la-terraza');
  });
});
