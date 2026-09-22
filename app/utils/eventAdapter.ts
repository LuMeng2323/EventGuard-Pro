import type { Event, EventItem } from "~/types/event";

// Keep the existing Cost storage contract isolated from the Events UI.
export const fromStoredEvent = (stored: EventItem): Event => ({
  id: String(stored.id),
  name: stored.name,
  type: stored.eventType === "Meeting" ? "meeting" : "exhibition",
  startDate: stored.startDate * 1000,
  endDate: stored.endDate * 1000,
  venues: [...stored.venue],
  organizer: stored.organizer,
  manager: stored.manager,
  phone: stored.phone,
  area: stored.area,
  expectedVisitors: stored.expectedVisitors,
  note: stored.note,
  createdAt: stored.createdAt ?? stored.id,
  updatedAt: stored.updatedAt ?? stored.id,
});
export const toStoredEvent = (
  event: Event,
  previous?: EventItem,
): EventItem => ({
  ...previous,
  id: Number(event.id),
  name: event.name,
  startDate: event.startDate / 1000,
  endDate: event.endDate / 1000,
  eventType: event.type === "meeting" ? "Meeting" : "Exhibition",
  venue: [...event.venues],
  organizer: event.organizer || "",
  manager: event.manager,
  area: event.area ?? 0,
  phone: event.phone,
  expectedVisitors: event.expectedVisitors,
  note: event.note,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
  level: previous?.level ?? "Medium",
  status: previous?.status ?? "Upcoming",
});
