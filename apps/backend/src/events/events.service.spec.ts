import { Test } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { makePrismaMock } from '../../test/prisma.mock';

describe('EventsService (Unit)', () => {
  let service: EventsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: makePrismaMock() as unknown as PrismaService },
      ],
    }).compile();
    service = module.get(EventsService);
  });
  it('lists events with filters and pagination', async () => {
    const res = await service.list({
      city: 'barcelona',
      category: 'techno',
      from: '2025-09-01',
      to: '2025-10-31',
      page: 1,
      pageSize: 10,
      sort: 'startAt',
      order: 'asc',
      featuredFirst: true,
    });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items[0]).toHaveProperty('title');
    expect(res.items[0].city.slug).toBe('barcelona');
  });
  it('returns detail by id ', async () => {
    const res = await service.byId('e12345678911');
    expect(res).toHaveProperty('id', 'e12345678911');
    expect(res.venue.city.slug).toBe('barcelona');
  });
  it('throws on missing id ', async () => {
    // const res = await service.byId('nope');
    // expect(res).rejects.toThrow
    await expect(service.byId('nope')).rejects.toThrow('Event not found');
  });
});
