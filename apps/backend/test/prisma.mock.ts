// test/utils/prisma.mock.ts
import { EventStatus, Prisma } from '@prisma/client';

const city = {
  id: 'c12345678911',
  name: 'Barcelona',
  country: 'Spain',
  countryCode: 'ES',
  timezone: 'Europe/Madrid',
  slug: 'barcelona',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const venue = {
  id: 'v12345678911',
  name: 'La Terraza',
  slug: 'la-terraza',
  address: 'Carrer 1',
  latitude: 41.38,
  longitude: 2.17,
  images: [] as string[],
  capacity: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  cityId: 'c12345678911',
  city,
};

const cats = [
  {
    id: 'cat12345678911',
    name: 'Techno',
    slug: 'techno',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const events = [
  {
    id: 'e12345678911',
    title: 'Neon Nights',
    slug: 'neon-nights',
    description: 'desc',
    startAt: new Date('2025-10-01T20:00:00Z'),
    endAt: new Date('2025-10-02T02:00:00Z'),
    ageRestriction: 18,
    status: EventStatus.PUBLISHED,
    isFeatured: true,
    coverImage: null as string | null,
    gallery: [] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
    venueId: 'v12345678911',
    venue: { ...venue, city },
    categoryLinks: [
      {
        eventId: 'e12345678911',
        categoryId: 'cat12345678911',
        addedAt: new Date(),
        category: cats[0],
      },
    ],
    tickets: [
      {
        id: 't12345678911',
        name: 'General',
        currency: 'EUR',
        price: new Prisma.Decimal(20),
        quantityTotal: 200,
        quantitySold: 50,
        salesStart: new Date(),
        salesEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        eventId: 'e12345678911',
      },
    ],
  },
];

type Where = any; // keep it loose for test ergonomics

function filterEvent(e: any, where: Where): boolean {
  if (!where) return true;

  // status
  if (where.status && e.status !== where.status) return false;

  // startAt range
  if (where.startAt?.gte && e.startAt < where.startAt.gte) return false;
  if (where.startAt?.lte && e.startAt > where.startAt.lte) return false;

  // category slug: { categoryLinks: { some: { category: { slug: 'techno' }}}}
  const catSlug = where.categoryLinks?.some?.category?.slug;
  if (catSlug) {
    const hasCat = e.categoryLinks?.some?.((cl: any) => cl.category?.slug === catSlug);
    if (!hasCat) return false;
  }

  // venue city: { venue: { city: { slug: 'barcelona' } } }
  const citySlug = where.venue?.city?.slug;
  if (citySlug && e.venue?.city?.slug !== citySlug) return false;

  // add more fields here as needed

  return true;
}

function applyOrder<T extends Record<string, any>>(list: T[], orderBy: any) {
  if (!orderBy) return list;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];

  let out = [...list];
  for (const ord of orders) {
    // ord can be { field: 'asc' } or { field: { sort: 'asc', nulls: 'last' } } in Prisma
    const [k, v] = Object.entries(ord)[0] as [string, any];
    const dir = typeof v === 'string' ? v : (v?.sort ?? 'asc');

    out = out.sort((a, b) => {
      const va = a[k];
      const vb = b[k];
      if (va === vb) return 0;
      return (va > vb ? 1 : -1) * (dir === 'desc' ? -1 : 1);
    });
  }
  return out;
}

export function makePrismaMock() {
  const prisma = {
    event: {
      count: jest.fn(
        async (args?: any) => events.filter((e) => filterEvent(e, args?.where)).length,
      ),

      findMany: jest.fn(async (args?: any) => {
        let list = events.filter((e) => filterEvent(e, args?.where));
        list = applyOrder(list, args?.orderBy);
        if (args?.skip) list = list.slice(args.skip);
        if (args?.take) list = list.slice(0, args.take);
        // NOTE: we’re ignoring select/include for simplicity; add if you need
        return list;
      }),

      findUnique: jest.fn(async (args: any) => {
        const w = args?.where ?? {};
        if (w.id) return events.find((e) => e.id === w.id) ?? null;
        if (w.slug) return events.find((e) => e.slug === w.slug) ?? null;
        return null;
      }),
    },

    venue: {
      findUnique: jest.fn(async (args: any) => {
        const w = args?.where ?? {};
        if (w.id === 'v12345678911') return venue;
        if (w.slug === 'la-terraza') return venue;
        return null;
      }),
    },

    // Supports both [$query1, $query2] and callback form
    $transaction: jest.fn(async (arg: any) => {
      if (Array.isArray(arg)) {
        // array form
        return Promise.all(arg);
      }
      if (typeof arg === 'function') {
        // callback form: (tx) => { ... }
        // we don’t implement isolation levels, etc. Just reuse the same mock.
        return arg(prisma);
      }
      throw new Error('$transaction mock received unsupported argument');
    }),
  } as any;

  return prisma;
}

// Export seeds if your tests want to assert shapes directly
export const __seed__ = { city, venue, cats, events };
