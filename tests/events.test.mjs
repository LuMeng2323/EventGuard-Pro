import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { computed, toValue } from "vue";
const load = (file, names, context = {}) => {
  const source = fs
    .readFileSync(new URL(file, import.meta.url), "utf8")
    .replace(/^import [\s\S]*?;\n/gm, "")
    .replace(/export /g, "");
  vm.runInNewContext(
    ts.transpile(source, { target: ts.ScriptTarget.ESNext }) +
      `\nglobalThis.result = { ${names} };`,
    context,
  );
  return context.result;
};
const date = load(
  "../app/utils/eventDate.ts",
  "monthBounds,eventsInMonth,monthDays,timelinePlacement,formatEventDate",
);
const { getOverlapGroups } = load(
  "../app/composables/useEventOverlap.ts",
  "getOverlapGroups",
  { computed, toValue },
);
const adapter = load(
  "../app/utils/eventAdapter.ts",
  "fromStoredEvent,toStoredEvent",
);
const stamp = (value) => new Date(value + "T00:00:00").getTime();
const event = (id, start, end = start) => ({
  id,
  name: id,
  type: "exhibition",
  startDate: stamp(start),
  endDate: stamp(end),
  venues: ["Hall 1"],
  manager: "Manager",
  createdAt: 1,
  updatedAt: 1,
});
test("inclusive monthly filtering, leap year and clipped single-day timeline", () => {
  const events = [
    event("a", "2026-08-30", "2026-09-03"),
    event("b", "2026-09-29", "2026-10-02"),
    event("c", "2026-10-01"),
    event("d", "2026-09-22"),
  ];
  const month = stamp("2026-09-01");
  assert.equal(date.eventsInMonth(events, month).length, 3);
  assert.equal(date.monthDays(stamp("2028-02-01")).length, 29);
  assert.equal(date.timelinePlacement(events[0], month).gridColumn, "1 / 4");
  assert.equal(date.timelinePlacement(events[1], month).gridColumn, "29 / 31");
  assert.equal(date.timelinePlacement(events[3], month).gridColumn, "22 / 23");
  assert.equal(
    date.formatEventDate(stamp("2026-09-22"), stamp("2026-09-22")),
    "Sep 22, 2026",
  );
});
test("transitive overlaps, shared endpoints and singleton exclusion", () => {
  const groups = getOverlapGroups([
    event("a", "2026-09-03", "2026-09-06"),
    event("b", "2026-09-06", "2026-09-09"),
    event("c", "2026-09-09", "2026-09-11"),
    event("d", "2026-09-20"),
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].events.length, 3);
  assert.equal(getOverlapGroups([]).length, 0);
});
test("storage adapter preserves staffing associations and converts units only at boundary", () => {
  const old = {
    id: 123,
    costId: "cost-1",
    name: "Example",
    startDate: stamp("2026-09-22") / 1000,
    endDate: stamp("2026-09-22") / 1000,
    eventType: "Meeting",
    venue: ["Hall 1"],
    manager: "Manager",
    organizer: "Org",
    area: 20,
    level: "High",
    status: "Upcoming",
  };
  const model = adapter.fromStoredEvent(old);
  assert.equal(model.id, "123");
  assert.equal(model.type, "meeting");
  assert.equal(model.startDate, old.startDate * 1000);
  model.venues.push("Hall 2");
  assert.equal(old.venue.length, 1);
  const saved = adapter.toStoredEvent(
    { ...model, phone: "123", expectedVisitors: 50, note: "Note" },
    old,
  );
  assert.equal(saved.costId, "cost-1");
  assert.equal(saved.id, 123);
  assert.equal(saved.startDate, old.startDate);
  assert.equal(saved.phone, "123");
  assert.equal(saved.expectedVisitors, 50);
});

test("event CRUD keeps linked storage, metadata and month filters consistent", async () => {
  const { ref } = await import("vue");
  const initial = {
    id: 1,
    costId: "cost-1",
    name: "Original",
    eventType: "Exhibition",
    startDate: stamp("2026-09-03") / 1000,
    endDate: stamp("2026-09-04") / 1000,
    venue: ["Hall 1"],
    manager: "Manager",
    organizer: "",
    area: 10,
    level: "High",
    status: "Upcoming",
  };
  const stored = ref([initial]);
  const costs = ref([{ eventId: 1 }]);
  const context = {
    ref,
    computed,
    ...date,
    ...adapter,
    startOfDay: (value) =>
      new Date(new Date(value).setHours(0, 0, 0, 0)).getTime(),
    shiftMonth: (value, offset) =>
      new Date(
        new Date(value).getFullYear(),
        new Date(value).getMonth() + offset,
        1,
      ).getTime(),
    onMounted: (fn) => fn(),
    useEventCosts: () => ({ events: stored, costs }),
    venueGroup: [
      { options: ["Hall 1", "Hall 2"] },
      { options: ["Meeting Room"] },
    ],
    ElMessage: { success: () => {}, warning: () => {} },
    ElMessageBox: { confirm: async () => {} },
  };
  const { useEvents } = load(
    "../app/composables/useEvents.ts",
    "useEvents",
    context,
  );
  const store = useEvents();
  const changed = {
    ...store.events.value[0],
    name: "Updated",
    phone: "123",
    note: "Details",
    expectedVisitors: 100,
  };
  store.saveEvent(changed);
  assert.equal(stored.value[0].costId, "cost-1");
  assert.equal(stored.value[0].phone, "123");
  store.saveEvent({
    ...changed,
    id: "",
    type: "meeting",
    venues: ["Meeting Room"],
  });
  assert.equal(store.events.value.length, 2);
  store.typeFilter.value = "meeting";
  assert.equal(store.filteredEvents.value.length, 1);
  await store.deleteEvent(store.events.value[0]);
  assert.equal(stored.value.length, 2);
  costs.value = [];
  await store.deleteEvent(store.events.value[0]);
  assert.equal(stored.value.length, 1);
  assert.throws(() =>
    store.saveEvent({
      ...changed,
      id: "",
      type: "exhibition",
      venues: ["Meeting Room"],
    }),
  );
});

test("form drafts are isolated, clearable dates are safe, reopening resets cancelled edits", async () => {
  const { ref, reactive, watch, nextTick } = await import("vue");
  const original = event("a", "2026-09-22");
  const props = reactive({ modelValue: false, event: original });
  const source = fs
    .readFileSync(
      new URL(
        "../app/components/events/form/EventFormDialog.vue",
        import.meta.url,
      ),
      "utf8",
    )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import [\s\S]*?;\n/gm, "");
  const emissions = [];
  const ctx = {
    ref,
    reactive,
    watch,
    computed,
    nextTick,
    defineProps: () => props,
    defineEmits:
      () =>
      (...args) =>
        emissions.push(args),
    venueGroup: [{ options: ["Hall 1", "Hall 2"] }],
    startOfDay: (value) =>
      new Date(new Date(value).setHours(0, 0, 0, 0)).getTime(),
  };
  vm.runInNewContext(
    ts.transpile(source, { target: ts.ScriptTarget.ESNext }) +
      "\nglobalThis.api={form,dateRange,formRef,submit};",
    ctx,
  );
  props.modelValue = true;
  await nextTick();
  ctx.api.form.venues.push("Hall 2");
  ctx.api.form.name = "Cancelled";
  assert.equal(original.venues.length, 1);
  assert.equal(original.name, "a");
  ctx.api.dateRange.value = null;
  assert.equal(ctx.api.form.dates.length, 0);
  props.modelValue = false;
  await nextTick();
  props.modelValue = true;
  await nextTick();
  assert.equal(ctx.api.form.name, "a");
  assert.equal(ctx.api.form.venues.length, 1);
  ctx.api.formRef.value = {
    validate: async () => false,
    clearValidate: () => {},
  };
  await ctx.api.submit();
  assert.equal(emissions.length, 0);
  ctx.api.formRef.value = {
    validate: async () => true,
    clearValidate: () => {},
  };
  await ctx.api.submit();
  assert.equal(emissions[0][0], "submit");
  assert.equal(emissions[0][1].startDate, original.startDate);
});


test("staffing upserts one estimate per event, validates counts and persists independently", async () => {
  const { ref } = await import("vue");
  const storage = new Map();
  let failWrite = false;
  const makeStore = () => {
    const state = new Map();
    return load("../app/composables/useEventStaffing.ts", "useEventStaffing", {
      useState: (key, init) => { if (!state.has(key)) state.set(key, ref(init())); return state.get(key); },
      onMounted: (fn) => fn(),
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => { if (failWrite) throw new Error("Storage full"); storage.set(key, value); },
      },
      crypto: { randomUUID: () => "estimate-1" },
      ElMessage: { error: () => {} },
    }).useEventStaffing(ref([{ id: "event-1" }]));
  };
  const store = makeStore();
  const first = store.saveEstimate("event-1", { securityCount: 20, screeningCount: 5, note: "  Entry  " });
  const second = store.saveEstimate("event-1", { securityCount: 0, screeningCount: 12 });
  assert.equal(second.id, first.id);
  assert.equal(second.createdAt, first.createdAt);
  assert.equal(first.note, "Entry");
  assert.equal(storage.size, 1);
  assert.equal(JSON.parse([...storage.values()][0]).length, 1);
  assert.equal(makeStore().getEstimate("event-1").screeningCount, 12);
  for (const invalid of [-1, 1.5, NaN, Infinity, undefined, null, "3"]) {
    assert.throws(() => store.saveEstimate("event-1", { securityCount: invalid, screeningCount: 0 }));
    assert.throws(() => store.saveEstimate("event-1", { securityCount: 0, screeningCount: invalid }));
  }
  assert.throws(() => store.saveEstimate("missing", { securityCount: 0, screeningCount: 0 }));
  failWrite = true;
  assert.throws(() => store.saveEstimate("event-1", { securityCount: 99, screeningCount: 0 }));
  assert.equal(store.getEstimate("event-1").screeningCount, 12);
  failWrite = false;
  store.removeEstimate("event-1");
  assert.equal(makeStore().getEstimate("event-1"), null);
  storage.set("eventguard-event-staffing-v1", "corrupt");
  const broken = makeStore();
  assert.equal(broken.available.value, false);
  assert.throws(() => broken.saveEstimate("event-1", { securityCount: 0, screeningCount: 0 }));
  assert.equal(storage.get("eventguard-event-staffing-v1"), "corrupt");
});
