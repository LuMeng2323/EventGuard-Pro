export interface EventStaffingEstimate {
  id: string;
  eventId: string;
  securityCount: number;
  screeningCount: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export type EventStaffingDraft = Pick<
  EventStaffingEstimate,
  "securityCount" | "screeningCount" | "note"
>;
