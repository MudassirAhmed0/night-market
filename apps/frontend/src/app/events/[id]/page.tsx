import Image from "next/image";
import type { EventDetail } from "@/lib/types";
import Providers from "@/app/providers";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { apiGET } from "@/lib/api";

// Client component that might show “favorite”/share/etc.
import ClientBar from "./client-bar";

type Props = { params: { id: string } };

async function fetchEvent(id: string) {
  return apiGET<EventDetail>(`/events/${id}`, { noStore: true });
}

export default async function EventDetailPage({ params }: Props) {
  const event = await fetchEvent(params.id);

  // Prepare React Query hydration (so ClientBar gets data instantly)
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ["event", params.id],
    queryFn: () => fetchEvent(params.id),
  });
  const dehydrated = dehydrate(qc);

  return (
    <Providers state={dehydrated}>
      <article className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted">
            {event.venue.city.name} · {event.venue.name}
          </p>
        </header>

        {event.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {event.description && (
          <p className="opacity-90 leading-relaxed">{event.description}</p>
        )}

        <section>
          <h2 className="font-semibold mb-2">Tickets</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {event.tickets.map((t) => (
              <li key={t.id} className="rounded-xl border border-border p-3">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm opacity-80">
                  {t.currency} {t.price}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Client-only actions (uses hydrated cache) */}
        <ClientBar id={event.id} />
      </article>
    </Providers>
  );
}
