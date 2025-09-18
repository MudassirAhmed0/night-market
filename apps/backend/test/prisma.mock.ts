// test/utils/prisma.mock.ts
import { EventStatus, Prisma } from '@prisma/client';

// -------- Domain shapes (narrow + test-only) --------
type City = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type Venue = {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  cityId: string;
  city: City;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type EventCategoryLink = {
  eventId: string;
  categoryId: string;
  addedAt: Date;
  category: Category;
};

type Ticket = {
  id: string;
  name: string;
  currency: string;
  price: Prisma.Decimal;
  quantityTotal: number;
  quantitySold: number;
  salesStart: Date;
  salesEnd: Date;
  createdAt: Date;
  updatedAt: Date;
  eventId: string;
};

type Event = {
  id: string;
  title: string;
  slug: string;
  description: string;
  startAt: Date;
  endAt: Date;
  ageRestriction: number;
  status: EventStatus;
  isFeatured: boolean;
  coverImage: string | null;
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
  venueId: string;
  venue: Venue;
  categoryLinks: EventCategoryLink[];
  tickets: Ticket[];
};

// -------- Filter / order inputs (small Prisma-ish subset) --------
type EventWhere = {
  status?: EventStatus;
  startAt?: { gte?: Date; lte?: Date };
  categoryLinks?: { some?: { category?: { slug?: string } } };
  venue?: { city?: { slug?: string } };
};

type OrderDir = 'asc' | 'desc';
type OrderValue = OrderDir | { sort?: OrderDir; nulls?: 'first' | 'last' };

// allow orderBy: { field: 'asc' } | [{ field: 'desc' }, ...]
type EventOrderBy =
  | Partial<Record<keyof Event, OrderValue>>
  | Array<Partial<Record<keyof Event, OrderValue>>>;

// -------- Seeds --------
const city: City = {
  id: 'c12345678911',
  name: 'Barcelona',
  country: 'Spain',
  countryCode: 'ES',
  timezone: 'Europe/Madrid',
  slug: 'barcelona',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const venue: Venue = {
  id: 'v12345678911',
  name: 'La Terraza',
  slug: 'la-terraza',
  address: 'Carrer 1',
  latitude: 41.38,
  longitude: 2.17,
  images: [],
  capacity: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
  cityId: 'c12345678911',
  city,
};

const cats: Category[] = [
  {
    id: 'cat12345678911',
    name: 'Techno',
    slug: 'techno',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const events: Event[] = [
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
    coverImage: null,
    gallery: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    venueId: 'v12345678911',
    venue,
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

// -------- Utils --------
function filterEvent(e: Event, where?: EventWhere): boolean {
  if (!where) return true;

  if (where.status && e.status !== where.status) return false;

  if (where.startAt?.gte && e.startAt < where.startAt.gte) return false;
  if (where.startAt?.lte && e.startAt > where.startAt.lte) return false;

  const catSlug = where.categoryLinks?.some?.category?.slug;
  if (catSlug) {
    const hasCat = e.categoryLinks?.some((cl) => cl.category?.slug === catSlug);
    if (!hasCat) return false;
  }

  const citySlug = where.venue?.city?.slug;
  if (citySlug && e.venue?.city?.slug !== citySlug) return false;

  return true;
}

function applyOrder<T extends Record<string, unknown>>(
  list: T[],
  orderBy?: Partial<Record<keyof T, OrderValue>> | Array<Partial<Record<keyof T, OrderValue>>>,
): T[] {
  if (!orderBy) return list;

  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  let out = [...list];

  for (const ord of orders) {
    if (!ord) continue;
    const entries = Object.entries(ord) as [keyof T, OrderValue][];
    if (entries.length === 0) continue;

    const [k, v] = entries[0];
    const dir: OrderDir = typeof v === 'string' ? v : (v?.sort ?? 'asc');

    out = out.sort((a, b) => {
      const va = a[k] as unknown;
      const vb = b[k] as unknown;
      if (va === vb) return 0;
      // best-effort comparison for mock purposes
      return ((va as any) > (vb as any) ? 1 : -1) * (dir === 'desc' ? -1 : 1);
    });
  }

  return out;
}

// -------- Mock API surface --------
type EventCountArgs = { where?: EventWhere };
type EventFindManyArgs = {
  where?: EventWhere;
  orderBy?: EventOrderBy;
  skip?: number;
  take?: number;
};
type EventFindUniqueArgs = { where: { id?: string; slug?: string } };
type VenueFindUniqueArgs = { where: { id?: string; slug?: string } };

type TransactionArg = Array<unknown> | ((tx: PrismaMock) => unknown);

type PrismaMock = {
  event: {
    count: jest.Mock<Promise<number>, [EventCountArgs?]>;
    findMany: jest.Mock<Promise<Event[]>, [EventFindManyArgs?]>;
    findUnique: jest.Mock<Promise<Event | null>, [EventFindUniqueArgs]>;
  };
  venue: {
    findUnique: jest.Mock<Promise<Venue | null>, [VenueFindUniqueArgs]>;
  };
  $transaction: jest.Mock<Promise<unknown>, [TransactionArg]>;
};

export function makePrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    event: {
      count: jest.fn((args?: EventCountArgs) =>
        Promise.resolve(events.filter((e) => filterEvent(e, args?.where)).length),
      ),

      findMany: jest.fn((args?: EventFindManyArgs) => {
        let list = events.filter((e) => filterEvent(e, args?.where));
        list = applyOrder(list, args?.orderBy);
        if (typeof args?.skip === 'number') list = list.slice(args.skip);
        if (typeof args?.take === 'number') list = list.slice(0, args.take);
        return Promise.resolve(list);
      }),

      findUnique: jest.fn((args: EventFindUniqueArgs) => {
        const w = args?.where ?? {};
        if (w.id) return Promise.resolve(events.find((e) => e.id === w.id) ?? null);
        if (w.slug) return Promise.resolve(events.find((e) => e.slug === w.slug) ?? null);
        return Promise.resolve(null);
      }),
    },

    venue: {
      findUnique: jest.fn((args: VenueFindUniqueArgs) => {
        const w = args?.where ?? {};
        if (w.id === 'v12345678911') return Promise.resolve(venue);
        if (w.slug === 'la-terraza') return Promise.resolve(venue);
        return Promise.resolve(null);
      }),
    },

    // Supports both [$query1, $query2] and callback form
    $transaction: jest.fn((arg: TransactionArg) => {
      if (Array.isArray(arg)) {
        // Array form: Promise.all over unknown[] is fine
        return Promise.all(arg);
      }
      if (typeof arg === 'function') {
        // Callback form
        return Promise.resolve(arg(prisma));
      }
      return Promise.reject(new Error('$transaction mock received unsupported argument'));
    }),
  };

  return prisma;
}

// Export seeds if your tests want to assert shapes directly
export const __seed__ = { city, venue, cats, events };
