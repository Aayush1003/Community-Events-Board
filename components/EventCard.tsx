import Link from "next/link";
import { Bell, CalendarDays, MapPin, Tag } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/format";

type EventCardProps = {
  event: {
    id: string;
    title: string;
    category: string;
    city: string;
    dateTime: string;
    price: number;
    description: string;
    imageUrl: string;
    isActive: boolean;
    isReminder?: boolean;
  };
  userLoggedIn?: boolean;
  onToggleReminder?: (eventId: string) => Promise<void> | void;
};

export function EventCard({ event, userLoggedIn, onToggleReminder }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <img src={event.imageUrl} alt={event.title} className="h-48 w-full object-cover" />

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
            {event.category}
          </span>
          <button
            type="button"
            onClick={() => onToggleReminder?.(event.id)}
            disabled={!userLoggedIn || !onToggleReminder}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              event.isReminder
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            } ${!userLoggedIn ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label={event.isReminder ? "Remove reminder" : "Add reminder"}
          >
            <Bell size={14} />
            {event.isReminder ? "Reminded" : "Remind me"}
          </button>
        </div>

        <Link href={`/events/${event.id}`} className="block">
          <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
        </Link>

        <div className="mt-3 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>{formatDateTime(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{event.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={16} />
            <span>{formatPrice(event.price)}</span>
          </div>
        </div>

        <p className="mt-4 line-clamp-3 text-sm text-slate-600">{event.description}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-600">
            {event.isActive ? "Active" : "Inactive"}
          </span>
          <Link
            href={`/events/${event.id}`}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            View event
          </Link>
        </div>
      </div>
    </article>
  );
}
