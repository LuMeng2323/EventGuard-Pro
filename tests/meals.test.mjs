import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { ref, computed, readonly } from "vue";
const load = (file, names, context = {}) => {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8").replace(/^import [\s\S]*?;\n/gm, "").replace(/export /g, "");
  vm.runInNewContext(ts.transpile(source, { target: ts.ScriptTarget.ESNext }) + "\nglobalThis.api={" + names + "};", context);
  return context.api;
};
const dates = load("../app/utils/eventDate.ts", "startOfDay");
const utils = load("../app/utils/mealCalculation.ts", "mealDay,activeOnMealDate,mealSuggestion,mealMessage,validMealOrder,validMealRecord,cloneMealRecord", dates);
const order = () => ({
  mealDate: utils.mealDay(1), eventItems: [{ eventId: "a", eventName: "A", staffCount: 24 }], suggestedQuantity: 24, quantity: 26,
  recipientId: "", recipientName: "", message: "Order 26 meals",
});
const setup = (sender = async () => { throw Error("Not configured"); }) => {
  const storage = new Map();
  let calls = 0, serial = 0, failWrite = false;
  const make = () => {
    const states = new Map();
    return load("../app/composables/useMealRecords.ts", "useMealRecords", {
      ...utils, ref, computed, readonly, Error,
      useMealSender: () => ({ send: async data => { calls++; return sender(data); } }),
      useState: (key, init) => { if (!states.has(key)) states.set(key, ref(init())); return states.get(key); },
      onMounted: fn => fn(),
      crypto: { randomUUID: () => String(++serial) },
      localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if (failWrite) throw Error("Storage full"); storage.set(key, value); } },
    }).useMealRecords();
  };
  return { storage, make, calls: () => calls, fail: value => failWrite = value };
};
test("real adapter explicitly fails without pretending to deliver", async () => {
  const { useMealSender } = load("../app/composables/useMealSender.ts", "useMealSender");
  await assert.rejects(useMealSender().send(order()), /not configured/);
});
test("initial send persists before delivery; resend appends under one record; edits never send", async () => {
  let resolve;
  const env = setup(() => new Promise(r => { resolve = r; }));
  const store = env.make();
  const original = order();
  const pending = store.createAndSend(original);
  assert.equal(store.history.value.length, 1);
  assert.equal(store.history.value[0].sendStatus, "sending");
  assert.equal(JSON.parse(env.storage.get("eventguard-meal-records-v1"))[0].sendAttempts.length, 1);
  const id = store.history.value[0].id;
  await assert.rejects(store.resend(id), /already sending/);
  assert.throws(() => store.edit(id, { ...original, quantity: 30 }), /Wait/);
  original.eventItems[0].staffCount = 99;
  resolve();
  const sent = await pending;
  assert.equal(sent.sendStatus, "sent");
  assert.ok(sent.sendAttempts[0].sentAt);
  assert.equal(sent.eventItems[0].staffCount, 24);
  store.edit(id, { quantity: 30, recipientId: "user", recipientName: "Recipient", message: "30 meals" });
  assert.equal(env.calls(), 1);
  assert.equal(store.history.value[0].sendAttempts.length, 1);
  const retry = store.resend(id);
  assert.equal(store.history.value.length, 1);
  assert.equal(store.history.value[0].sendAttempts.length, 2);
  resolve();
  await retry;
  assert.equal(store.history.value[0].sendAttempts[0].status, "sent");
  assert.equal(store.history.value[0].quantity, 30);
  assert.equal(env.make().history.value.length, 1);
});
test("failed attempts remain visible and repeated sends on same date are separate orders", async () => {
  const env = setup();
  const store = env.make();
  const first = await store.createAndSend(order());
  assert.equal(first.sendStatus, "failed");
  assert.equal(first.sendAttempts[0].errorMessage, "Not configured");
  await store.resend(first.id);
  assert.equal(store.history.value.length, 1);
  assert.equal(store.history.value[0].sendAttempts.length, 2);
  await store.createAndSend(order());
  assert.equal(store.history.value.length, 2);
  assert.equal(env.make().history.value.length, 2);
});
test("missing counts remain unknown; lower and zero quantities valid; malformed quantities rejected", async () => {
  const env = setup();
  const store = env.make();
  const data = order();
  data.eventItems.push({ eventId: "b", eventName: "Unknown", staffCount: null });
  data.quantity = 0;
  assert.equal(utils.mealSuggestion(data.eventItems).suggestedQuantity, 24);
  assert.match(utils.mealMessage(data), /Unknown: Not estimated/);
  const saved = await store.createAndSend(data);
  assert.equal(saved.eventItems[1].staffCount, null);
  for (const quantity of [-1, 1.5, NaN, undefined])
    await assert.rejects(store.createAndSend({ ...data, quantity }));
});
test("storage failure blocks delivery; interrupted sends recover without retry", async () => {
  const env = setup();
  const store = env.make();
  env.fail(true);
  await assert.rejects(store.createAndSend(order()), /Storage full/);
  assert.equal(env.calls(), 0);
  assert.equal(store.history.value.length, 0);
  env.fail(false);
  const record = await store.createAndSend(order());
  record.sendStatus = "sending";
  record.sendAttempts.push({ id: "pending", status: "sending", createdAt: Date.now() });
  env.storage.set("eventguard-meal-records-v1", JSON.stringify([record]));
  const restored = env.make();
  assert.equal(restored.history.value[0].sendStatus, "failed");
  assert.match(restored.history.value[0].sendAttempts.at(-1).errorMessage, /unknown/);
  assert.equal(env.calls(), 1);
  env.storage.set("eventguard-meal-records-v1", "corrupt");
  assert.equal(env.make().available.value, false);
  assert.equal(env.storage.get("eventguard-meal-records-v1"), "corrupt");
});
test("result persistence failure preserves pending attempt and disables additional sends", async () => {
  let finish;
  const env = setup(() => new Promise(r => { finish = r; }));
  const store = env.make();
  const pending = store.createAndSend(order());
  env.fail(true);
  finish();
  await assert.rejects(pending, /could not be saved/);
  assert.equal(store.available.value, false);
  assert.equal(JSON.parse(env.storage.get("eventguard-meal-records-v1"))[0].sendStatus, "sending");
});
test("suggestion provider uses inclusive daily events, not the visible Events month", () => {
  const stamp = text => new Date(text + "T00:00:00").getTime();
  const events = ref([{ id: "a", name: "A", startDate: stamp("2026-12-30"), endDate: stamp("2027-01-02") }, { id: "b", name: "B", startDate: stamp("2027-01-02"), endDate: stamp("2027-01-02") }]);
  const provider = load("../app/composables/useMealSuggestion.ts", "useMealSuggestion", {
    ...utils, computed, useEvents: () => ({ events, ready: ref(true) }),
    useEventStaffing: () => ({ available: ref(true), getEstimate: id => id === "a" ? { securityCount: 20, screeningCount: 4 } : null }),
  }).useMealSuggestion();
  const result = provider.suggest(stamp("2027-01-02"));
  assert.equal(result.eventItems.length, 2);
  assert.equal(result.suggestedQuantity, 24);
  assert.equal(result.eventItems[1].staffCount, null);
  assert.equal(provider.suggest(stamp("2027-01-03")).eventItems.length, 0);
});
