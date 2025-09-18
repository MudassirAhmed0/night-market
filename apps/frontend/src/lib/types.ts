// Mirror of backend responses we return from services

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  isFeatured: boolean;
  coverImage: string | null;
  city: { slug: string; name: string; countryCode: string };
  venue: { id: string; name: string; slug: string };
  categories: { slug: string; name: string }[];
  minPrice: number | null;
};

export type EventListResponse = {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type EventDetail = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  isFeatured: boolean;
  coverImage?: string | null;
  gallery: string[];
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    coordinates: { lat: number | null; lng: number | null };
    city: {
      id: string;
      slug: string;
      name: string;
      country: string;
      countryCode: string;
      timezone: string;
    };
  };
  categories: { id: string; slug: string; name: string }[];
  tickets: {
    id: string;
    name: string;
    currency: string;
    price: number;
    quantityTotal: number;
    quantitySold: number;
    salesStart: string;
    salesEnd: string;
  }[];
};
