import type { MealEventItem, MealOrder, MealRecord } from "~/types/meal";
import { startOfDay } from "~/utils/eventDate";
export const mealDay = (offset = 0) => {
  const d = new Date();
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + offset,
  ).getTime();
};
export const formatMealDate = (value: number) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
export const activeOnMealDate = (start: number, end: number, date: number) =>
  startOfDay(start) <= startOfDay(date) && startOfDay(end) >= startOfDay(date);
export const isMealCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export const mealSuggestion = (eventItems: MealEventItem[]) => {
  const suggestedQuantity = eventItems.reduce(
    (sum, item) => sum + (item.staffCount ?? 0),
    0,
  );
  if (!isMealCount(suggestedQuantity))
    throw new Error("Staff total exceeds the supported range");
  return {
    eventItems: eventItems.map((item) => ({ ...item })),
    suggestedQuantity,
  };
};
export const mealMessage = (
  order: Pick<MealOrder, "mealDate" | "eventItems" | "quantity">,
) =>
  [
    formatMealDate(order.mealDate) + " Meal Order",
    "",
    ...order.eventItems.map(
      (item) => item.eventName + ": " + (item.staffCount ?? "Not estimated"),
    ),
    "",
    "Total: " + order.quantity + " meals",
  ].join("\n");
export const validMealOrder = (value: unknown): value is MealOrder => {
  if (!value || typeof value !== "object") return false;
  const r = value as MealOrder;
  if (
    !Number.isFinite(r.mealDate) ||
    !Number.isFinite(new Date(r.mealDate).getTime()) ||
    !isMealCount(r.quantity) ||
    !isMealCount(r.suggestedQuantity) ||
    ![r.recipientId, r.recipientName, r.message].every(
      (v) => typeof v === "string",
    ) ||
    !r.message.trim() ||
    !Array.isArray(r.eventItems)
  )
    return false;
  const ids = new Set<string>();
  for (const item of r.eventItems) {
    if (
      !item ||
      typeof item.eventId !== "string" ||
      !item.eventId ||
      typeof item.eventName !== "string" ||
      ids.has(item.eventId) ||
      (item.staffCount !== null && !isMealCount(item.staffCount))
    )
      return false;
    ids.add(item.eventId);
  }
  return (
    r.eventItems.reduce((sum, item) => sum + (item.staffCount ?? 0), 0) ===
    r.suggestedQuantity
  );
};
export const validMealRecord = (value: unknown): value is MealRecord => {
  if (!validMealOrder(value)) return false;
  const r = value as MealRecord;
  if (
    typeof r.id !== "string" ||
    !r.id ||
    !Number.isFinite(r.createdAt) ||
    !Number.isFinite(r.updatedAt) ||
    !Array.isArray(r.sendAttempts) ||
    !r.sendAttempts.length
  )
    return false;
  const ids = new Set<string>();
  for (const a of r.sendAttempts) {
    if (
      !a ||
      typeof a.id !== "string" ||
      !a.id ||
      ids.has(a.id) ||
      !["sending", "sent", "failed"].includes(a.status) ||
      !Number.isFinite(a.createdAt) ||
      (a.sentAt !== undefined && !Number.isFinite(a.sentAt)) ||
      (a.status === "sent" && a.sentAt === undefined) ||
      (a.errorMessage !== undefined && typeof a.errorMessage !== "string")
    )
      return false;
    ids.add(a.id);
  }
  return r.sendStatus === r.sendAttempts.at(-1)?.status;
};
export const cloneMealRecord = (record: MealRecord): MealRecord => ({
  ...record,
  eventItems: record.eventItems.map((item) => ({ ...item })),
  sendAttempts: record.sendAttempts.map((attempt) => ({ ...attempt })),
});
