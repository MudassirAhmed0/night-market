/* eslint-disable no-console */
import { PrismaClient, EventStatus, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

type CitySeed = {
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  slug: string;
};

const categoriesSeed = [
  { name: 'Techno', slug: 'techno' },
  { name: 'House', slug: 'house' },
  { name: 'Hip Hop', slug: 'hiphop' },
  { name: 'Live', slug: 'live' },
  { name: 'Festival', slug: 'festival' },
  { name: 'Latin', slug: 'latin' },
];

const citiesSeed: CitySeed[] = [
  {
    name: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    timezone: 'Europe/Madrid',
    slug: 'barcelona',
  },
  {
    name: 'Madrid',
    country: 'Spain',
    countryCode: 'ES',
    timezone: 'Europe/Madrid',
    slug: 'madrid',
  },
  {
    name: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    timezone: 'Europe/Lisbon',
    slug: 'lisbon',
  },
  { name: 'Milan', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', slug: 'milan' },
  { name: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', slug: 'paris' },
];

const venueNames = [
  'Club Eclipse',
  'The Warehouse',
  'Neon Alley',
  'UnderGround 54',
  'La Terraza',
  'Moonlight Hall',
  'Riviera Rooms',
  'Temple District',
  'Pulse Dome',
  'The Atrium',
  'Cathedral Club',
  'Harbor Stage',
  'Metro Vault',
  'Electric Yard',
  'Velvet Cave',
];

const categorySlugs = categoriesSeed.map((c) => c.slug);

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pickDates() {
  // spread within [-45, +45] days around today
  const future = faker.date.soon({ days: 45 });
  const past = faker.date.recent({ days: 45 });
  const start = faker.datatype.boolean() ? future : past;
  const durationHours = faker.number.int({ min: 3, max: 10 });
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return { startAt: start, endAt: end };
}

function randomSubset<T>(arr: T[], min = 1, max = 3) {
  const k = faker.number.int({ min, max });
  return faker.helpers.arrayElements(arr, k);
}

async function main() {
  console.time('seed');

  // Clean in dependency order (explicit M:N join first)
  await prisma.eventCategory.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.city.deleteMany();

  // Categories
  await prisma.category.createMany({ data: categoriesSeed });
  const allCategories = await prisma.category.findMany();

  // Cities
  const cities = await Promise.all(
    citiesSeed.map((c) =>
      prisma.city.create({
        data: c,
      }),
    ),
  );

  // Venues: 3 per city
  const venues = [];
  for (const city of cities) {
    const chosen = faker.helpers.arrayElements(venueNames, 3);
    for (const vn of chosen) {
      const vSlug = slugify(`${vn}-${city.slug}-${faker.number.int({ min: 1, max: 999 })}`);
      const venue = await prisma.venue.create({
        data: {
          name: vn,
          slug: vSlug,
          address: faker.location.streetAddress({ useFullAddress: true }),
          latitude: Number(faker.location.latitude()),
          longitude: Number(faker.location.longitude()),
          images: [
            faker.image.urlPicsumPhotos({ width: 1200, height: 800 }),
            faker.image.urlPicsumPhotos({ width: 1200, height: 800 }),
          ],
          capacity: faker.number.int({ min: 300, max: 3000 }),
          cityId: city.id,
        },
      });
      venues.push(venue);
    }
  }

  // Events: ~12 per city => ~60 total
  let eventCount = 0;
  for (const city of cities) {
    for (let i = 0; i < 12; i++) {
      const venue = faker.helpers.arrayElement(venues.filter((v) => v.cityId === city.id));
      const title =
        faker.helpers.arrayElement([
          'Midnight Pulse',
          'Rhythm & Vibes',
          'Neon Nights',
          'Afterdark Session',
          'Bassline Odyssey',
          'Velvet Groove',
          'Warehouse Ritual',
          'Sunset Sessions',
          'Moonlit Movement',
          'Frequency Shift',
          'House & Tech',
          'Retro Funk Jam',
        ]) +
        ' ' +
        faker.word.adjective();

      const { startAt, endAt } = pickDates();
      const slug = slugify(`${title}-${venue.slug}-${startAt.getTime()}`);
      const chosenCats = randomSubset(categorySlugs, 1, 3);
      const catIds = allCategories.filter((c) => chosenCats.includes(c.slug)).map((c) => c.id);

      const event = await prisma.event.create({
        data: {
          title,
          slug,
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
          startAt,
          endAt,
          ageRestriction:
            faker.helpers.maybe(() => faker.number.int({ min: 18, max: 21 }), {
              probability: 0.6,
            }) ?? null,
          status: faker.helpers.arrayElement([EventStatus.PUBLISHED, EventStatus.DRAFT]),
          isFeatured: faker.datatype.boolean(),
          coverImage: faker.image.urlPicsumPhotos({ width: 1600, height: 900 }),
          gallery: [
            faker.image.urlPicsumPhotos({ width: 1600, height: 900 }),
            faker.image.urlPicsumPhotos({ width: 1600, height: 900 }),
          ],
          venueId: venue.id,

          // Attach categories via explicit join model using nested create
          categoryLinks: {
            create: catIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          },

          // Tickets: we’ll add separately with createMany below
        },
      });

      // Ticket types per event
      const now = new Date();
      const earlyStart = new Date(startAt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const stdStart = new Date(startAt.getTime() - 20 * 24 * 60 * 60 * 1000);
      const vipStart = new Date(startAt.getTime() - 15 * 24 * 60 * 60 * 1000);

      await prisma.ticketType.createMany({
        data: [
          {
            name: 'Early Bird',
            currency: 'EUR',
            price: new Prisma.Decimal(faker.number.int({ min: 8, max: 15 })),
            quantityTotal: faker.number.int({ min: 50, max: 200 }),
            quantitySold: faker.number.int({ min: 0, max: 50 }),
            salesStart: earlyStart < now ? now : earlyStart,
            salesEnd: new Date(startAt.getTime() - 14 * 24 * 60 * 60 * 1000),
            eventId: event.id,
          },
          {
            name: 'General',
            currency: 'EUR',
            price: new Prisma.Decimal(faker.number.int({ min: 16, max: 30 })),
            quantityTotal: faker.number.int({ min: 100, max: 400 }),
            quantitySold: faker.number.int({ min: 0, max: 100 }),
            salesStart: stdStart < now ? now : stdStart,
            salesEnd: new Date(startAt.getTime() - 1 * 24 * 60 * 60 * 1000),
            eventId: event.id,
          },
          {
            name: 'VIP',
            currency: 'EUR',
            price: new Prisma.Decimal(faker.number.int({ min: 35, max: 80 })),
            quantityTotal: faker.number.int({ min: 20, max: 100 }),
            quantitySold: faker.number.int({ min: 0, max: 50 }),
            salesStart: vipStart < now ? now : vipStart,
            salesEnd: new Date(startAt.getTime() - 1 * 24 * 60 * 60 * 1000),
            eventId: event.id,
          },
        ],
      });

      eventCount++;
    }
  }

  console.log(
    `Seeded: cities=${cities.length}, venues=${venues.length}, events=${eventCount}, categories=${allCategories.length}`,
  );
  console.timeEnd('seed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
