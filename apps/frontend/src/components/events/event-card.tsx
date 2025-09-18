import { EventListItem } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";


export default function EventCard ({event}:{event:EventListItem}){
    return( <li className="rounded-2xl  border border-border  overflow-hidden  bg-card text-cardFg">
        <Link href={`/events/${event.id}`} className="block foucs:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`View ${event.title}`}
        >   
        <div className="relative bg-card aspect-[16/9]">
        {event.coverImage &&
            <Image
                fill
                alt={event.title}
                src={event.coverImage}
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
            />
        }
        </div>
        <div className="p-4 space-y-1">
            <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                <p className="text-sm opacity-80">{event.city.name} . {event.venue.name}</p>
            {
                event.minPrice != null && <p className="text-sm">From €{event.minPrice}</p>
            }
        </div>
        </Link>
    </li>)
}