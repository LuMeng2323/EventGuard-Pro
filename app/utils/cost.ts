import type { DailyStaffRecord, EventCostItem, MonthlyCostResult } from "~/types/cost";
import type { EventItem } from "~/types/event";

export const dateKey = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid event date");
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const eventDates = (event: Pick<EventItem, "startDate" | "endDate">) => {
  const start = dateKey(event.startDate);
  const end = dateKey(event.endDate);
  if (start > end) throw new Error("Event end date must not precede its start date");
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  while (cursor.toISOString().slice(0, 10) <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
};

export const emptyDailyRecord = (date: string): DailyStaffRecord => ({
  date,
  guard: { count: 0, startTime: "08:00", endTime: "18:00", overtimeShifts: [] },
  inspector: { count: 0, startTime: "08:00", endTime: "18:00" },
  remark: "",
});

export const createOvertimeShift = (day: DailyStaffRecord, id: string) => ({
  id,
  count: 1,
  startTime: day.guard.overtimeShifts.length
    ? day.guard.overtimeShifts[day.guard.overtimeShifts.length - 1]!.endTime || ""
    : day.guard.endTime || "",
  endTime: "",
});

const validTime = (value: unknown): value is string => typeof value === "string" && /^([01]\d|2[0-3]):(00|30)$/.test(value);
export const shiftHours = (start: string, end: string) => {
  if (!validTime(start) || !validTime(end) || start === end) throw new Error("Enter distinct valid start and end times");
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return ((minutes(end) - minutes(start) + 1440) % 1440) / 60;
};

export const staffingTotals = (records: DailyStaffRecord[]) => ({
  guards: records.reduce((sum, day) => sum + day.guard.count, 0),
  inspectors: records.reduce((sum, day) => sum + day.inspector.count, 0),
  overtime: records.reduce((sum, day) => sum + day.guard.overtimeShifts.reduce((total, shift) => total + shift.count, 0), 0),
});

export const validateDailyRecords = (cost: EventCostItem, event: EventItem): string | null => {
  const dates = eventDates(event);
  if (!Array.isArray(cost.dailyRecords) || cost.dailyRecords.length !== dates.length ||
    dates.some((date, index) => cost.dailyRecords[index]?.date !== date)) return "Daily records must match every date in the current event range. Edit and save this record.";
  const count = (value: number) => Number.isSafeInteger(value) && value >= 0;
  const validShift = (start: unknown, end: unknown) => validTime(start) && validTime(end) && start !== end;
  for (const day of cost.dailyRecords) {
    if (day.needsReview) return `${day.date}: review and confirm the migrated overtime information`;
    if (!day.guard || !day.inspector || !count(day.guard.count) || !count(day.inspector.count)) return `${day.date}: counts must be non-negative whole numbers`;
    if (day.guard.count > 0 && !validShift(day.guard.startTime, day.guard.endTime)) return `${day.date}: enter valid normal guard working times`;
    if ((day.inspector.startTime || day.inspector.endTime) && !validShift(day.inspector.startTime, day.inspector.endTime)) return `${day.date}: provide both optional inspector times or leave both blank`;
    if (!Array.isArray(day.guard.overtimeShifts)) return `${day.date}: invalid overtime shifts`;
    const ids = new Set<string>();
    for (const shift of day.guard.overtimeShifts) {
      if (!shift.id || ids.has(shift.id)) return `${day.date}: overtime shifts must have unique IDs`;
      ids.add(shift.id);
      if (!count(shift.count) || shift.count === 0) return `${day.date}: overtime shift count must be a positive whole number`;
      if (!validShift(shift.startTime, shift.endTime)) return `${day.date}: enter valid start and end times for every overtime shift`;
    }
    if (day.remark !== undefined && typeof day.remark !== "string") return `${day.date}: invalid remark`;
  }
  return null;
};

interface PreviousDailyRecord {
  date: string;
  securityGuardCount: number;
  securityInspectorCount: number;
  guardStartTime: string;
  guardEndTime: string;
  inspectorStartTime?: string;
  inspectorEndTime?: string;
  overtimeGuardCount: number;
  overtimeInspectorCount: number;
  overtimeHours: number;
  remark?: string;
}

export const migrateDailyRecord = (old: PreviousDailyRecord, index: number): DailyStaffRecord => ({
  date: old.date,
  guard: {
    count: old.securityGuardCount,
    startTime: old.guardStartTime,
    endTime: old.guardEndTime,
    overtimeShifts: old.overtimeGuardCount > 0 ? [{ id: `migrated-${index}`, count: old.overtimeGuardCount, startTime: "", endTime: "" }] : [],
  },
  inspector: { count: old.securityInspectorCount, startTime: old.inspectorStartTime || "", endTime: old.inspectorEndTime || "" },
  remark: old.remark || "",
  needsReview: old.overtimeGuardCount > 0 || old.overtimeInspectorCount > 0 || old.overtimeHours > 0,
});

// Called only by the explicit monthly calculation action, never by the entry form.
export const calculateStaffingMonth = (records: DailyStaffRecord[], month: string, calculatedAt = Date.now()): MonthlyCostResult => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Select a valid month");
  const days = records.filter((day) => day.date.startsWith(`${month}-`));
  const guardCost = days.reduce((sum, day) => sum + day.guard.count * 300, 0);
  const inspectorCost = days.reduce((sum, day) => sum + day.inspector.count * 350, 0);
  const overtimeCost = Math.round(days.reduce((sum, day) => sum + day.guard.overtimeShifts.reduce((amount, shift) => amount + shift.count * shiftHours(shift.startTime, shift.endTime) * 35, 0), 0) * 100) / 100;
  const total = Math.round((guardCost + inspectorCost + overtimeCost) * 100) / 100;
  if (!Number.isFinite(total) || total > Number.MAX_SAFE_INTEGER) throw new Error("Calculated cost exceeds the supported range");
  return { month, guardCost, inspectorCost, overtimeCost, total, calculatedAt };
};
