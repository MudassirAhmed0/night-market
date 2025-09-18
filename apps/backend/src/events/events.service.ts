import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetEventsQueryDto, EventListItem, EventListResponse } from './dto/get-events.query.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: GetEventsQueryDto): Promise<EventListResponse> {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const orderBy: Prisma.EventOrderByWithRelationInput[] = [];

    // Featured first (tie-breaker with sort)
    if (q.featuredFirst) orderBy.push({ isFeatured: 'desc' });

    // Sort field
    orderBy.push({ [q.sort ?? 'startAt']: q.order ?? 'desc' });

    const where: Prisma.EventWhereInput = {
      status: 'PUBLISHED',
      ...(q.from || q.to
        ? {
            startAt: {
              gte: q.from ? new Date(q.from) : undefined,
              lte: q.to ? new Date(q.to) : undefined,
            },
          }
        : {}),
      ...(q.category
        ? {
            categoryLinks: {
              some: {
                category: { slug: q.category },
              },
            },
          }
        : {}),
      ...(q.city
        ? {
            venue: { city: { slug: q.city } },
          }
        : {}),
    };

    const [total, events] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
              city: { select: { slug: true, name: true, countryCode: true } },
            },
          },
          categoryLinks: {
            include: { category: { select: { slug: true, name: true } } },
          },
          tickets: { select: { price: true } },
        },
      }),
    ]);

    const items: EventListItem[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      status: e.status,
      isFeatured: e.isFeatured,
      coverImage: e.coverImage ?? null,
      city: {
        slug: e.venue.city.slug,
        name: e.venue.city.name,
        countryCode: e.venue.city.countryCode,
      },
      venue: {
        id: e.venue.id,
        name: e.venue.name,
        slug: e.venue.slug,
      },
      categories: e.categoryLinks.map((cl) => cl.category),
      minPrice:
        e.tickets.length > 0
          ? Number(
              e.tickets.reduce((min, t) => (t.price.lt(min) ? t.price : min), e.tickets[0].price),
            )
          : null,
    }));

    return { items, page, pageSize, total };
  }

  async byId(id: string) {
    const e = await this.prisma.event.findUnique({
      where: { id },
      include: {
        venue: {
          include: { city: true },
        },
        categoryLinks: { include: { category: true } },
        tickets: true,
      },
    });
    if (!e) throw new NotFoundException('Event not found');

    return {
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      status: e.status,
      isFeatured: e.isFeatured,
      coverImage: e.coverImage,
      gallery: e.gallery,
      venue: {
        id: e.venue.id,
        name: e.venue.name,
        slug: e.venue.slug,
        address: e.venue.address,
        coordinates: { lat: e.venue.latitude, lng: e.venue.longitude },
        city: {
          id: e.venue.city.id,
          slug: e.venue.city.slug,
          name: e.venue.city.name,
          country: e.venue.city.country,
          countryCode: e.venue.city.countryCode,
          timezone: e.venue.city.timezone,
        },
      },
      categories: e.categoryLinks.map((c) => ({
        id: c.category.id,
        slug: c.category.slug,
        name: c.category.name,
      })),
      tickets: e.tickets.map((t) => ({
        id: t.id,
        name: t.name,
        currency: t.currency,
        price: Number(t.price),
        quantityTotal: t.quantityTotal,
        quantitySold: t.quantitySold,
        salesStart: t.salesStart.toISOString(),
        salesEnd: t.salesEnd.toISOString(),
      })),
    };
  }
}
