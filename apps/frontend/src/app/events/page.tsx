import EventCard from "@/components/events/event-card";
import FilterBar from "@/components/events/filter-bar";
import { apiGET } from "@/lib/api";
import { EventListResponse } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // default revalidate for this route (ISR)

type Props = {
  searchParams: {
    city?: string;
    category?: string;
    from?: string;
    to?: string;
    sort?: 'startAt' | 'createdAt';
    order?: 'asc' | 'desc';
    page?: string;
    pageSize?: string;
  };
};

// function hrefWith(
//   searchParams: Record<string, string | number | undefined>,
//   patch: Record<string, string | number>
// ) {
//   const params = new URLSearchParams();
//   for (const [k, v] of Object.entries(searchParams))
//     if (v !== undefined) params.set(k, String(v));
//   for (const [k, v] of Object.entries(patch)) params.set(k, String(v));
//   return `/events?${params.toString()}`;
// }
function makeHref(q: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) p.set(k, v);
  return `/events?${p.toString()}`;
}

function toInt(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function EventsPage({ searchParams }: Props) {
  const page = toInt(searchParams?.page, 1);
  const pageSize = toInt(searchParams?.pageSize, 12);
  const sort = (searchParams?.sort ?? 'startAt') as 'startAt' | 'createdAt';
  const order = (searchParams?.order ?? 'asc') as 'asc' | 'desc';

  const data = await apiGET<EventListResponse>("/events", {
    revalidate,
    query: {
      city: searchParams?.city,
      category: searchParams?.category,
      from: searchParams?.from,
      to: searchParams?.to || undefined,
      sort,
      order,
      page,
      pageSize,
    },
  });

  const facetSrc = await apiGET<EventListResponse>('/events', {
    revalidate: 300,
    query: { page: 1, pageSize: 1000, sort: 'startAt', order: 'asc' },
  });
  const cities = Array.from(
    new Map(
      facetSrc.items.map((e) => [e.city.slug, { value: e.city.slug, label: `${e.city.name} (${e.city.countryCode})` }]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));

  const categories = Array.from(
    new Map(
      facetSrc.items.flatMap((e) => e.categories).map((c) => [c.slug, { value: c.slug, label: c.name }]),
    ).values(),
  ).sort((a, b) => a.label.localeCompare(b.label));
  return (
    <section className="space-y-6">
    <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-muted">Server-rendered list with ISR · filters are encoded in the URL for SEO.</p>
      </header>

      <FilterBar
        cities={cities}
        categories={categories}
        initial={{
          city: searchParams?.city,
          category: searchParams?.category,
          from: searchParams?.from,
          to: searchParams?.to,
          pageSize,
        }}
      />

{data.items.length === 0 ? (
        <div className="rounded-2xl border border-border p-6 bg-card text-cardFg">
          <p className="font-medium">No results.</p>
          <p className="text-sm opacity-80">Try changing filters or <a className="underline" href="/events">reset</a>.</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((event) => <EventCard key={event.id} event={event} />)}
          </ul>

          {/* Pagination stays server-rendered for SEO */}
          <nav className="flex items-center gap-2">
            {page > 1 && (
              <a
                className="underline"
                href={hrefWith({ ...searchParams, page: String(page - 1), pageSize: String(pageSize) })}
              >
                Previous
              </a>
            )}
            {page * pageSize < data.total && (
              <a
                className="underline"
                href={makeHref({ ...searchParams, page: String(page + 1), pageSize: String(pageSize) })}
              >
                Next
              </a>
            )}
            <span className="text-sm opacity-70 ml-auto">Page {page} · {data.total} results</span>
          </nav>
        </>
      )}
    </section>
  );
}
