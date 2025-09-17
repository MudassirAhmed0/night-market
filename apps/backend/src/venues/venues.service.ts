import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async byId(id: string) {
    const v = await this.prisma.venue.findUnique({
      where: { id },
      include: {
        city: true,
      },
    });
    if (!v) throw new NotFoundException('Venue not found');

    return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      address: v.address,
      images: v.images,
      capacity: v.capacity,
      coordinates: { lat: v.latitude, lng: v.longitude },
      city: {
        id: v.city.id,
        slug: v.city.slug,
        name: v.city.name,
        country: v.city.country,
        countryCode: v.city.countryCode,
        timezone: v.city.timezone,
      },
    };
  }
}
