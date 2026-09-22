export interface EventItem {
  id: number;
  costId?: string;
  phone?: string;
  expectedVisitors?: number;
  note?: string;
  createdAt?: number;
  updatedAt?: number;
  name: string;
  startDate: number;
  endDate: number;
  eventType: "Exhibition" | "Meeting";
  venue: string[];
  area: number;
  organizer: string;
  //   expectedPeople: number;
  level: "High" | "Medium" | "Low";
  manager: string;
  status: "Ongoing" | "Upcoming" | "Completed";
}

/** Public Events model. All timestamps are milliseconds. */
export interface Event {
  id: string;
  name: string;
  type: "exhibition" | "meeting";
  startDate: number;
  endDate: number;
  venues: string[];
  organizer?: string;
  manager: string;
  phone?: string;
  area?: number;
  expectedVisitors?: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}
