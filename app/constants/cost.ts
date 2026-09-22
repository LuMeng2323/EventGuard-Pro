export const securityCategories = [
  { value: "Security Guard", label: "安保员 / Security Guard", dailyRate: 300 },
  {
    value: "Security Screener",
    label: "安检员 / Security Screener",
    dailyRate: 350,
  },
] as const;

export const defaultCostRate = {
  securityDailyRate: 300,
  screeningDailyRate: 350,
} satisfies import("~/types/cost").CostRate;
