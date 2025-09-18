import { apiGET } from "@/lib/api";
import { EventListResponse } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // default revalidate for this route (ISR)

type Props = {
  searchParams: {
    city?: string;
    category?: string;
    page?: string;
    pageSize?: string;
    from?: string;
    to?: string;
    sort?: "startAt" | "createdAt";
    order?: "asc" | "desc";
  };
};

function hrefWith(
  searchParams: Record<string, string | number | undefined>,
  patch: Record<string, string | number>
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams))
    if (v !== undefined) params.set(k, String(v));
  for (const [k, v] of Object.entries(patch)) params.set(k, String(v));
  return `/events?${params.toString()}`;
}

export default async function EventsPage({ searchParams }: Props) {
  const page = Number(searchParams.page || 1);
  const pageSize = Number(searchParams.pageSize || 12);

  const data = await apiGET<EventListResponse>("/events", {
    revalidate,
    query: {
      city: searchParams.city,
      category: searchParams.category,
      from: searchParams.from,
      to: searchParams.to,
      sort: searchParams.sort ?? "startAt",
      order: searchParams.order ?? "asc",
      page,
      pageSize,
    },
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-muted">
          SEO-friendly list with ISR and URL-based filters.
        </p>
      </header>

      {/* Grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((e) => (
          <li
            key={e.id}
            className="rounded-2xl border border-border overflow-hidden"
          >
            <Link
              href={`/events/${e.id}`}
              className="block focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="aspect-[16/9] bg-card relative">
                {e.coverImage && (
                  <Image
                    src={e.coverImage}
                    alt={e.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1">{e.title}</h3>
                <p className="text-sm opacity-80">
                  {e.city.name} · {e.venue.name}
                </p>
                {e.minPrice != null && (
                  <p className="text-sm mt-1">From €{e.minPrice}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Pagination (simple links; keep server-rendered) */}
      <nav className="flex items-center gap-2">
        {page > 1 && (
          <Link
            href={hrefWith(searchParams, { page: page - 1, pageSize })}
            className="underline"
          >
            Previous
          </Link>
        )}
        {page * pageSize < data.total && (
          <Link
            href={hrefWith(searchParams, { page: page + 1, pageSize })}
            className="underline"
          >
            Next
          </Link>
        )}
        <span className="text-sm opacity-70 ml-auto">
          Page {page} · {data.total} results
        </span>
      </nav>
    </section>
  );
}
