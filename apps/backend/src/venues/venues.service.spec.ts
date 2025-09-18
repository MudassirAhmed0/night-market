import { Test } from '@nestjs/testing';
import { VenuesService } from './venues.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { makePrismaMock } from '../../test/prisma.mock';

describe('VenuesService (Unit)', () => {
  let service: VenuesService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VenuesService,
        { provide: PrismaService, useValue: makePrismaMock() as unknown as PrismaService },
      ],
    }).compile();

    service = module.get(VenuesService);
  });

  it('returns venue by id', async () => {
    const res = await service.byId('v12345678911');
    expect(res).toHaveProperty('id', 'v12345678911');
  });
  it('throw on missing venue & bad request becaues of validaton pipe', async () => {
    await expect(service.byId('nope')).rejects.toThrow('Venue not found');
  });
});
