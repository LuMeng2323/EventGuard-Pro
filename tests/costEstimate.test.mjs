import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { ref, computed, readonly } from "vue";
const load = (file, names, context = {}) => {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8")
    .replace(/^import [\s\S]*?;\n/gm, "").replace(/export /g, "");
  vm.runInNewContext(ts.transpile(source, { target: ts.ScriptTarget.ESNext }) + "\nglobalThis.api = {" + names + "};", context);
  return context.api;
};
const dates = load("../app/utils/eventDate.ts", "monthBounds,shiftMonth,eventsInMonth");
const calc = load("../app/utils/costCalculation.ts", "eventsInCostMonth,inclusiveEventDays,isCostRate,calculateEventCost,summarizeCosts", dates);
const stamp = date => new Date(date + "T00:00:00").getTime();
const event = (start, end) => ({ id: "a", name: "Example", startDate: stamp(start), endDate: stamp(end) });
const estimate = { eventId: "a", securityCount: 10, screeningCount: 2 };
const rate = { securityDailyRate: 300, screeningDailyRate: 350 };
test("cross-month cost belongs only to end month; Events retains overlap behavior", () => {
  const item = event("2026-09-29", "2026-10-02");
  assert.equal(calc.eventsInCostMonth([item], stamp("2026-09-01")).length, 0);
  assert.equal(calc.eventsInCostMonth([item], stamp("2026-10-01")).length, 1);
  assert.equal(dates.eventsInMonth([item], stamp("2026-09-01")).length, 1);
  const row = calc.calculateEventCost(item, estimate, rate);
  assert.equal(row.eventDays, 4);
  assert.equal(row.cost.securityCost, 12000);
  assert.equal(row.cost.screeningCost, 2800);
  assert.equal(row.cost.totalCost, 14800);
});
test("cross-year costs belong only to end year and month", () => {
  const item = event("2026-12-30", "2027-01-02");
  for (const month of ["2026-12-01", "2026-01-01", "2027-02-01"])
    assert.equal(calc.eventsInCostMonth([item], stamp(month)).length, 0);
  assert.equal(calc.eventsInCostMonth([item], stamp("2027-01-01")).length, 1);
  assert.equal(calc.calculateEventCost(item, estimate, rate).eventDays, 4);
});
test("inclusive calendar days handle single days, leap years and daylight saving", () => {
  assert.equal(calc.inclusiveEventDays(stamp("2026-09-30"), stamp("2026-09-30")), 1);
  assert.equal(calc.inclusiveEventDays(stamp("2028-02-28"), stamp("2028-03-01")), 3);
  assert.equal(calc.inclusiveEventDays(stamp("2026-03-07"), stamp("2026-03-09")), 3);
  assert.throws(() => calc.inclusiveEventDays(NaN, Date.now()));
  assert.throws(() => calc.inclusiveEventDays(stamp("2026-09-30"), stamp("2026-09-29")));
});
test("missing estimate excluded; zero counts are a valid estimate", () => {
  const item = event("2026-09-01", "2026-09-01");
  const missing = calc.calculateEventCost(item, null, rate);
  const zero = calc.calculateEventCost(item, { ...estimate, securityCount: 0, screeningCount: 0 }, rate);
  assert.equal(missing.cost, null);
  assert.equal(zero.cost.totalCost, 0);
  const summary = calc.summarizeCosts([missing, zero, calc.calculateEventCost(item, estimate, rate)]);
  assert.equal(summary.eventsWithEstimate, 2);
  assert.equal(summary.totalCost, 3700);
  assert.equal(calc.summarizeCosts([]).totalCost, 0);
});
test("rates validate, persist, reload and recalculate without copying staffing state", () => {
  const storage = new Map();
  let fail = false;
  const events = ref([event("2026-09-29", "2026-10-02")]);
  const staffing = ref({ ...estimate });
  const makeStore = () => {
    const states = new Map();
    return load("../app/composables/useCostEstimate.ts", "useCostEstimate", {
      ...calc, ...dates, ref, computed, readonly, defaultCostRate: rate,
      useEvents: () => ({ events, ready: ref(true) }),
      useEventStaffing: () => ({ available: ref(true), getEstimate: () => staffing.value }),
      useState: (key, init) => { if (!states.has(key)) states.set(key, ref(init())); return states.get(key); },
      onMounted: fn => fn(),
      localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if (fail) throw Error("Full"); storage.set(key, value); } },
      ElMessage: { error: () => {} },
    }).useCostEstimate();
  };
  const store = makeStore();
  store.month.value = stamp("2026-10-01");
  assert.equal(store.result.value.summary.totalCost, 14800);
  store.saveRate({ securityDailyRate: 100.5, screeningDailyRate: 0 });
  assert.equal(store.result.value.summary.totalCost, 4020);
  assert.equal(makeStore().rate.value.securityDailyRate, 100.5);
  staffing.value.securityCount = 5;
  assert.equal(store.result.value.summary.totalCost, 2010);
  for (const invalid of [-1, NaN, Infinity, undefined, null, "100"])
    assert.throws(() => store.saveRate({ securityDailyRate: invalid, screeningDailyRate: 0 }));
  fail = true;
  assert.throws(() => store.saveRate(rate));
  assert.equal(store.rate.value.securityDailyRate, 100.5);
  fail = false;
  store.saveRate({ securityDailyRate: 0, screeningDailyRate: 0 });
  assert.equal(store.result.value.summary.totalCost, 0);
  storage.set("eventguard-cost-rate-v1", "corrupt");
  assert.equal(makeStore().available.value, false);
  assert.equal(storage.get("eventguard-cost-rate-v1"), "corrupt");
});
