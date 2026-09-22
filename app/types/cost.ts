export interface OvertimeShift {
  id: string;
  count: number;
  startTime: string;
  endTime: string;
}

export interface DailyStaffRecord {
  date: string;
  guard: {
    count: number;
    startTime: string;
    endTime: string;
    overtimeShifts: OvertimeShift[];
  };
  inspector: {
    count: number;
    startTime?: string;
    endTime?: string;
  };
  remark?: string;
  needsReview?: boolean;
}

export interface MonthlyCostResult {
  month: string;
  guardCost: number;
  inspectorCost: number;
  overtimeCost: number;
  total: number;
  calculatedAt: number;
}

export interface EventCostItem {
  id: string;
  eventId: number;
  dailyRecords: DailyStaffRecord[];
  calculatedCost: number | null;
  calculatedAt: number | null;
  monthlyCosts: Record<string, MonthlyCostResult>;
  legacyData?: unknown;
}

export type EventCost = EventCostItem;

export interface CostRate {
  securityDailyRate: number;
  screeningDailyRate: number;
}

export interface EstimatedCost {
  securityCost: number;
  screeningCost: number;
  totalCost: number;
}

export interface CostEventRow {
  event: import("./event").Event;
  estimate: import("./eventStaffing").EventStaffingEstimate | null;
  eventDays: number;
  cost: EstimatedCost | null;
}

export interface CostSummary extends EstimatedCost {
  eventsWithEstimate: number;
}
