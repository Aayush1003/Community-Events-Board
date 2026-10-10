"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CalendarDays, MapPin, Tag, ArrowUpRight, Share2, Check } from "lucide-react";
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
  index?: number;
};

export function EventCard({ event, userLoggedIn, onToggleReminder, index = 0 }: EventCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article
      className={`glass-card group flex flex-col justify-between overflow-hidden rounded-2xl animate-fade-in-up stagger-${Math.min(index + 1, 9)}`}
      style={{
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div>
        {/* Image with overlay and badges */}
        <div className="relative h-52 w-full overflow-hidden bg-slate-900">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.2) 60%, transparent 100%)",
            }}
          />

          {/* Floating Category Badge */}
          <div className="absolute left-3 top-3">
            <span className="badge badge-orange backdrop-blur-md shadow-lg">
              {event.category}
            </span>
          </div>

          {/* Floating Share button */}
          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white backdrop-blur-md transition-all"
              style={{
                background: copied ? "rgba(16, 185, 129, 0.85)" : "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
              title={copied ? "Copied link!" : "Share event"}
              aria-label="Share event"
            >
              {copied ? <Check size={14} /> : <Share2 size={13} />}
            </button>
          </div>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 left-3">
            <span
              className="flex items-center gap-1.5 rounded-xl px-3 py-1 text-sm font-bold text-white shadow-lg"
              style={{
                background: "rgba(10, 10, 15, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Tag size={13} style={{ color: "var(--accent-orange)" }} />
              {formatPrice(event.price)}
            </span>
          </div>

          {/* Status badge */}
          <div className="absolute bottom-3 right-3">
            <span
              className={`badge ${event.isActive ? "badge-emerald" : "badge-slate"} backdrop-blur-md`}
              style={{ fontSize: "0.68rem" }}
            >
              {event.isActive ? "● Active" : "○ Inactive"}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Header row: Reminder button */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <CalendarDays size={14} style={{ color: "var(--accent-orange)" }} />
              <span>{formatDateTime(event.dateTime)}</span>
            </div>

            <button
              type="button"
              onClick={() => onToggleReminder?.(event.id)}
              disabled={!onToggleReminder}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: event.isReminder
                  ? "var(--gradient-primary)"
                  : "rgba(255,255,255,0.05)",
                color: event.isReminder ? "#fff" : "var(--text-secondary)",
                border: event.isReminder ? "none" : "1px solid var(--glass-border)",
                boxShadow: event.isReminder ? "0 0 15px var(--accent-orange-glow)" : "none",
                cursor: !userLoggedIn ? "pointer" : "pointer",
              }}
              title={
                !userLoggedIn
                  ? "Log in to set reminders"
                  : event.isReminder
                  ? "Remove reminder"
                  : "Save reminder"
              }
            >
              <Bell
                size={13}
                style={{
                  fill: event.isReminder ? "#fff" : "none",
                }}
              />
              <span>{event.isReminder ? "Reminded" : "Remind me"}</span>
            </button>
          </div>

          {/* Title */}
          <Link href={`/events/${event.id}`} className="block group/title">
            <h3
              className="text-lg font-bold line-clamp-1 transition-colors duration-200 group-hover/title:text-[#ff8c5a]"
              style={{ color: "var(--text-primary)" }}
            >
              {event.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={13} style={{ color: "var(--accent-purple)" }} />
            <span>{event.city}</span>
          </div>

          {/* Description */}
          <p
            className="mt-3 line-clamp-2 text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {event.description}
          </p>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-5 pt-0">
        <Link
          href={`/events/${event.id}`}
          className="btn-primary w-full text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5"
        >
          View Details
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
